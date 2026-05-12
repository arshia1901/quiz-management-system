from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import requests

app = Flask(__name__)
CORS(app)

with open("questions.json") as f:
    questions = json.load(f)

JUDGE0_URL = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true"

language_map = {
    "python": 71,
    "cpp": 54,
    "java": 62,
    "c": 50
}

# ---------------- CLEAN OUTPUT ----------------
def normalize(x):
    if x is None:
        return ""
    return str(x).strip().replace("\n", "").replace(" ", "")

# ---------------- PYTHON WRAPPER ----------------
def build_python_code(user_code, input_data):

    return f"""
{user_code}

import sys

data = sys.stdin.read().strip().split()

nums = list(map(int, data[:-1]))
target = int(data[-1])

print(twoSum(nums, target))
"""

# ---------------- JUDGE0 RUNNER ----------------
def run_code_judge0(code, lang_id, stdin=""):

    payload = {
        "source_code": code,
        "language_id": lang_id,
        "stdin": stdin
    }

    res = requests.post(JUDGE0_URL, json=payload)
    result = res.json()

    if result.get("compile_output"):
        return "COMPILATION ERROR"

    if result.get("stderr"):
        return "RUNTIME ERROR"

    return result.get("stdout", "").strip()

# ---------------- GET QUESTION ----------------
@app.route("/question")
def get_question():
    return jsonify(questions[0])

# ---------------- RUN CODE ----------------
@app.route("/run", methods=["POST"])
def run():

    data = request.json

    code = data["code"]
    language = data["language"]
    custom_input = data.get("customInput", "")

    question = questions[0]
    testcases = question["testcases"]

    lang_id = language_map[language]

    results = []
    passed = 0

    # ---------------- CUSTOM INPUT ----------------
    if custom_input:

        if language == "python":
            final_code = build_python_code(code, custom_input)
            output = run_code_judge0(final_code, lang_id)
        else:
            output = run_code_judge0(code, lang_id, custom_input)

        return jsonify({
            "verdict": "Custom Run",
            "output": output,
            "testResults": []
        })

    # ---------------- TEST CASE RUN ----------------
    for i, tc in enumerate(testcases):

        if language == "python":
            final_code = build_python_code(code, tc["input"])
            got = run_code_judge0(final_code, lang_id)
        else:
            got = run_code_judge0(code, lang_id, tc["input"])

        expected = tc["output"]

        is_pass = normalize(got) == normalize(expected)

        if is_pass:
            passed += 1

        results.append({
            "id": i + 1,
            "input": tc["input"],
            "expected": expected,
            "got": got,
            "pass": is_pass,
            "time": "Judge0"
        })

    verdict = "Accepted" if passed == len(testcases) else "Wrong Answer"

    return jsonify({
        "verdict": verdict,
        "output": f"{passed}/{len(testcases)} passed",
        "testResults": results
    })

if __name__ == "__main__":
    app.run(debug=True)