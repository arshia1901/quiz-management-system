"""
server/app.py  –  Flask backend for the Quiz coding interface
Uses Judge0's FREE public cloud instance — no API key, no RapidAPI account needed.
  https://ce.judge0.com  (rate-limited but free, no auth)

To switch to self-hosted Judge0 (unlimited, no rate limit):
  1. Install Docker
  2. Run:
       wget https://github.com/judge0/judge0/releases/download/v1.13.1/judge0-v1.13.1.zip
       unzip judge0-v1.13.1.zip && cd judge0-v1.13.1
       docker-compose up -d
  3. Change JUDGE0_URL below to "http://localhost:2358"

Requirements:
  pip install flask flask-cors requests
"""

import os
import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ── Judge0 config ─────────────────────────────────────────────────────────────
# Default: free public cloud, no key needed.
# Switch to "http://localhost:2358" when self-hosting with Docker.
JUDGE0_URL = os.getenv("JUDGE0_URL", "https://ce.judge0.com")

# Language IDs (Judge0 CE)
LANG_IDS = {
    "python": 71,   # Python 3.8.1
    "cpp":    54,   # C++ (GCC 9.2.0)
    "java":   62,   # Java (OpenJDK 13.0.1)
    "c":      50,   # C (GCC 9.2.0)
}


def submit_to_judge0(source_code: str, language_id: int, stdin: str) -> dict:
    """
    Submit one (code, stdin) pair to Judge0 and poll until a result comes back.
    Works with both the free public cloud and a self-hosted instance.
    """
    payload = {
        "source_code":     source_code,
        "language_id":     language_id,
        "stdin":           stdin,
        "cpu_time_limit":  5,       # seconds
        "memory_limit":    262144,  # KB (256 MB)
    }

    # ── 1. Create submission (non-blocking) ───────────────────────────────────
    try:
        create_resp = requests.post(
            f"{JUDGE0_URL}/submissions?base64_encoded=false&wait=false",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        create_resp.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"Could not reach Judge0 at {JUDGE0_URL}: {e}")

    token = create_resp.json().get("token")
    if not token:
        raise RuntimeError(f"Judge0 did not return a token. Response: {create_resp.text}")

    # ── 2. Poll for result ────────────────────────────────────────────────────
    # Status IDs: 1 = In Queue, 2 = Processing, 3+ = done
    for _ in range(30):          # max ~15 seconds
        time.sleep(0.5)
        try:
            poll = requests.get(
                f"{JUDGE0_URL}/submissions/{token}?base64_encoded=false",
                headers={"Content-Type": "application/json"},
                timeout=10,
            )
            poll.raise_for_status()
            data = poll.json()
            status_id = data.get("status", {}).get("id", 0)
            if status_id not in (1, 2):   # not queued/processing anymore
                return data
        except requests.exceptions.RequestException:
            continue  # retry on network hiccup

    return {"status": {"id": 0, "description": "Polling timed out"}, "stdout": "", "stderr": ""}


def parse_result(data: dict) -> dict:
    """Convert a raw Judge0 result into a clean { output, verdict, error } dict."""
    status_id   = data.get("status", {}).get("id", 0)
    stdout      = (data.get("stdout")         or "").strip()
    stderr      = (data.get("stderr")         or "").strip()
    compile_err = (data.get("compile_output") or "").strip()

    verdict_map = {
        3:  ("Accepted",            ""),
        4:  ("Wrong Answer",        ""),
        5:  ("Time Limit Exceeded", ""),
        6:  ("Compilation Error",   compile_err or stderr),
    }
    runtime_error_ids = {7, 8, 9, 10, 11, 12}

    if status_id in verdict_map:
        verdict, error = verdict_map[status_id]
    elif status_id in runtime_error_ids:
        verdict, error = "Runtime Error", stderr
    else:
        desc = data.get("status", {}).get("description", "Unknown Error")
        verdict, error = desc, stderr or compile_err

    return {
        "output":  stdout,
        "verdict": verdict,
        "error":   error,
        "time":    data.get("time", ""),
        "memory":  data.get("memory", ""),
    }


# ── /run ──────────────────────────────────────────────────────────────────────
@app.route("/run", methods=["POST"])
def run_code():
    """
    Body: { code, language_id, stdin }
    Executes against the provided stdin (sample / custom input).
    Returns: { output, verdict, error }
    """
    body        = request.json or {}
    code        = body.get("code", "").strip()
    language_id = int(body.get("language_id", LANG_IDS["python"]))
    stdin       = body.get("stdin", "")

    if not code:
        return jsonify({"output": "", "verdict": "No Code", "error": "Empty submission"}), 400

    try:
        raw    = submit_to_judge0(code, language_id, stdin)
        result = parse_result(raw)
        return jsonify(result)
    except Exception as e:
        return jsonify({"output": "", "verdict": "Server Error", "error": str(e)}), 500


# ── /submit ───────────────────────────────────────────────────────────────────
@app.route("/submit", methods=["POST"])
def submit_code():
    """
    Body: { code, language_id, test_cases: [{id, input, expected}] }
    Runs against ALL test cases, returns per-case results + overall verdict.
    Returns: { verdict, test_results: [{id, pass, expected, got, time, error}] }
    """
    body        = request.json or {}
    code        = body.get("code", "").strip()
    language_id = int(body.get("language_id", LANG_IDS["python"]))
    test_cases  = body.get("test_cases", [])

    if not code:
        return jsonify({"verdict": "No Code", "test_results": []}), 400
    if not test_cases:
        return jsonify({"verdict": "No Test Cases", "test_results": []}), 400

    results       = []
    all_passed    = True
    final_verdict = "Accepted"

    for tc in test_cases:
        tc_id    = tc.get("id", "?")
        stdin    = tc.get("input", "")
        expected = tc.get("expected", "").strip()

        try:
            raw    = submit_to_judge0(code, language_id, stdin)
            parsed = parse_result(raw)

            got    = parsed["output"].strip()
            passed = (got == expected) and parsed["verdict"] not in (
                "Compilation Error", "Runtime Error", "Time Limit Exceeded"
            )

            if not passed:
                all_passed    = False
                if final_verdict == "Accepted":
                    final_verdict = parsed["verdict"] if parsed["verdict"] != "Accepted" else "Wrong Answer"

            results.append({
                "id":       tc_id,
                "pass":     passed,
                "expected": expected,
                "got":      got,
                "time":     parsed.get("time", ""),
                "error":    parsed.get("error", ""),
            })

        except Exception as e:
            all_passed    = False
            final_verdict = "Server Error"
            results.append({
                "id":       tc_id,
                "pass":     False,
                "expected": expected,
                "got":      "",
                "time":     "",
                "error":    str(e),
            })

    if all_passed:
        final_verdict = "Accepted"

    return jsonify({"verdict": final_verdict, "test_results": results})


# ── /languages (optional helper) ─────────────────────────────────────────────
@app.route("/languages", methods=["GET"])
def languages():
    return jsonify(LANG_IDS)


# ── run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"[server] Using Judge0 at: {JUDGE0_URL}")
    app.run(debug=True, port=5000)