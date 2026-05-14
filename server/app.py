"""
Examify.ai — Flask Backend  (server/app.py)
=========================================================
Install deps:
  pip install flask flask-cors psycopg2-binary bcrypt PyJWT python-dotenv requests

Run:
  python app.py

Env vars needed (.env in server/):
  DATABASE_URL=postgresql://postgres:password@localhost:5432/examify
  JWT_SECRET=your_super_secret_key_here
  JUDGE0_URL=http://localhost:5000      # your Judge0 instance
"""

import os
import uuid
import json
import time
import requests
import bcrypt
import jwt
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timezone, timedelta
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, 
     origins=["http://localhost:5173", "http://localhost:3000"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],supports_credentials=True)  # Vite / CRA

# ─── Config ──────────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:sK23102004!@localhost:5432/examify")
JWT_SECRET   = os.getenv("JWT_SECRET", "examify_dev_secret_change_me")
JWT_EXPIRY   = int(os.getenv("JWT_EXPIRY_HOURS", 8))
JUDGE0_URL = os.getenv("JUDGE0_URL", "https://ce.judge0.com")


# ─── DB helpers ──────────────────────────────────────────────────────────────
def get_db():
    """Return a new psycopg2 connection (use inside a with-block)."""
    return psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)


def query(sql, params=(), fetchone=False, fetchall=False, commit=False):
    """
    Convenience wrapper.
      - commit=True  → INSERT / UPDATE / DELETE
      - fetchone     → SELECT one row as dict
      - fetchall     → SELECT many rows as list[dict]
    """
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            if commit:
                conn.commit()
                return cur.rowcount
            if fetchone:
                return cur.fetchone()
            if fetchall:
                return cur.fetchall()


# ─── JWT helpers ─────────────────────────────────────────────────────────────
def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub":  user_id,
        "role": role,
        "exp":  datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])


def require_auth(roles=None):
    """Decorator — verifies Bearer token and optionally checks role."""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            auth = request.headers.get("Authorization", "")
            if not auth.startswith("Bearer "):
                return jsonify({"error": "Missing token"}), 401
            try:
                payload = decode_token(auth.split(" ", 1)[1])
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Token expired"}), 401
            except jwt.PyJWTError:
                return jsonify({"error": "Invalid token"}), 401

            if roles and payload["role"] not in roles:
                return jsonify({"error": "Forbidden"}), 403

            request.user_id = payload["sub"]
            request.user_role = payload["role"]
            return f(*args, **kwargs)
        return wrapper
    return decorator


# ═══════════════════════════════════════════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/auth/register", methods=["POST"])
def register():
    """
    Body: { name, email, password, role, department?, designation?, roll_number?, semester? }
    """
    d = request.json or {}
    name     = (d.get("name") or "").strip()
    email    = (d.get("email") or "").strip().lower()
    password = d.get("password", "")
    role     = (d.get("role") or "STUDENT").upper()

    if not name or not email or not password:
        return jsonify({"error": "name, email, and password are required"}), 400
    if role not in ("STUDENT", "TEACHER", "ADMIN"):
        return jsonify({"error": "Invalid role"}), 400

    # check duplicate
    existing = query("SELECT user_id FROM users WHERE email=%s", (email,), fetchone=True)
    if existing:
        return jsonify({"error": "Email already registered"}), 409

    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user_id = str(uuid.uuid4())

    query(
        "INSERT INTO users (user_id, name, email, password_hash, role) VALUES (%s,%s,%s,%s,%s)",
        (user_id, name, email, pw_hash, role), commit=True
    )

    # profile rows
    if role == "STUDENT":
        query(
            "INSERT INTO student_profile (student_id, roll_number, department, semester) VALUES (%s,%s,%s,%s)",
            (user_id, d.get("roll_number"), d.get("department"), d.get("semester")), commit=True
        )
    elif role == "TEACHER":
        query(
            "INSERT INTO teacher_profile (teacher_id, department, designation) VALUES (%s,%s,%s)",
            (user_id, d.get("department"), d.get("designation")), commit=True
        )

    token = create_token(user_id, role)
    return jsonify({"token": token, "user_id": user_id, "name": name, "role": role}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    """
    Body: { email, password, role }
    Returns: { token, user_id, name, role, ... }
    """
    d = request.json or {}
    email    = (d.get("email") or "").strip().lower()
    password = d.get("password", "")
    role     = (d.get("role") or "").upper()

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    user = query(
        "SELECT user_id, name, email, password_hash, role FROM users WHERE email=%s",
        (email,), fetchone=True
    )

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
    if role and user["role"] != role:
        return jsonify({"error": "Role mismatch"}), 401
    if not bcrypt.checkpw(password.encode(), user["password_hash"].encode()):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_token(str(user["user_id"]), user["role"])

    resp = {
        "token":   token,
        "user_id": str(user["user_id"]),
        "name":    user["name"],
        "email":   user["email"],
        "role":    user["role"],
    }

    # attach profile extras
    if user["role"] == "STUDENT":
        profile = query(
            "SELECT batch_enrollment.batch_id FROM batch_enrollment "
            "WHERE batch_enrollment.student_id = %s LIMIT 1",
            (str(user["user_id"]),), fetchone=True
        )
        resp["batch_id"] = str(profile["batch_id"]) if profile else None

    return jsonify(resp), 200


# ═══════════════════════════════════════════════════════════════════════════════
# USERS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/users", methods=["GET"])
@require_auth(roles=["TEACHER", "ADMIN"])
def list_users():
    """Returns all users (teachers only). Query param: ?role=STUDENT"""
    role_filter = request.args.get("role")
    if role_filter:
        rows = query(
            """SELECT u.user_id, u.name, u.email, u.role, u.created_at,
                      be.batch_id
               FROM users u
               LEFT JOIN batch_enrollment be ON be.student_id = u.user_id
               WHERE u.role = %s
               ORDER BY u.name""",
            (role_filter.upper(),), fetchall=True
        )
    else:
        rows = query(
            """SELECT u.user_id, u.name, u.email, u.role, u.created_at,
                      be.batch_id
               FROM users u
               LEFT JOIN batch_enrollment be ON be.student_id = u.user_id
               ORDER BY u.name""",
            fetchall=True
        )
    result = []
    for r in rows:
        r = dict(r)
        r["user_id"] = str(r["user_id"])
        if r["batch_id"]:
            r["batch_id"] = str(r["batch_id"])
        result.append(r)
    return jsonify(result)

@app.route("/api/users/<user_id>", methods=["DELETE"])
@require_auth(roles=["TEACHER", "ADMIN"])
def delete_user(user_id):
    query("DELETE FROM users WHERE user_id=%s", (user_id,), commit=True)
    return jsonify({"ok": True})


# ═══════════════════════════════════════════════════════════════════════════════
# BATCHES
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/batches", methods=["GET"])
@require_auth()
def list_batches():
    if request.user_role == "TEACHER":
        batches = query(
            "SELECT * FROM batch WHERE created_by=%s ORDER BY created_at DESC",
            (request.user_id,),
            fetchall=True
        )
    else:
        batches = query("SELECT * FROM batch ORDER BY created_at DESC", fetchall=True)

    result = []
    for b in batches:
        b = dict(b)
        b["batch_id"] = str(b["batch_id"])

        students = query(
            """SELECT u.user_id, u.name, u.email
               FROM batch_enrollment be
               JOIN users u ON u.user_id = be.student_id
               WHERE be.batch_id = %s ORDER BY u.name""",
            (b["batch_id"],),
            fetchall=True
        )

        b["students"] = [dict(s) for s in students]
        result.append(b)

    return jsonify(result)


@app.route("/api/batches", methods=["POST"])
@require_auth(roles=["TEACHER", "ADMIN"])
def create_batch():
    d = request.json or {}
    batch_id = str(uuid.uuid4())
    query(
        """INSERT INTO batch (batch_id, name, department, semester, academic_year, subject, created_by)
           VALUES (%s,%s,%s,%s,%s,%s,%s)""",
        (batch_id, d.get("name"), d.get("department"), d.get("semester"),
         d.get("academic_year"), d.get("subject"), request.user_id),
        commit=True
    )
    return jsonify({"batch_id": batch_id, **d}), 201


@app.route("/api/batches/<batch_id>", methods=["DELETE"])
@require_auth(roles=["TEACHER", "ADMIN"])
def delete_batch(batch_id):
    has_quizzes = query("SELECT quiz_id FROM quiz WHERE batch_id=%s LIMIT 1",
                        (batch_id,), fetchone=True)
    if has_quizzes:
        return jsonify({"error": "Batch has quizzes. Remove them first."}), 409
    query("DELETE FROM batch WHERE batch_id=%s", (batch_id,), commit=True)
    return jsonify({"ok": True})


@app.route("/api/batches/<batch_id>/enroll", methods=["POST"])
@require_auth(roles=["TEACHER", "ADMIN"])
def enroll_student(batch_id):
    """Body: { student_id }"""
    student_id = (request.json or {}).get("student_id")
    if not student_id:
        return jsonify({"error": "student_id required"}), 400
    query(
        "INSERT INTO batch_enrollment (batch_id, student_id) VALUES (%s,%s) ON CONFLICT DO NOTHING",
        (batch_id, student_id), commit=True
    )
    return jsonify({"ok": True})


@app.route("/api/batches/<batch_id>/enroll/<student_id>", methods=["DELETE"])
@require_auth(roles=["TEACHER", "ADMIN"])
def remove_enrollment(batch_id, student_id):
    query("DELETE FROM batch_enrollment WHERE batch_id=%s AND student_id=%s",
          (batch_id, student_id), commit=True)
    return jsonify({"ok": True})


# ═══════════════════════════════════════════════════════════════════════════════
# QUIZZES
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/quizzes", methods=["GET"])
@require_auth()
def list_quizzes():
    """
    Teachers: all their quizzes.
    Students: live quizzes for their batch.
    """
    if request.user_role == "TEACHER":
        rows = query(
            """SELECT q.*, b.name AS batch_name
               FROM quiz q
               LEFT JOIN batch b ON b.batch_id = q.batch_id
               WHERE q.created_by = %s
               ORDER BY q.created_at DESC""",
            (request.user_id,), fetchall=True
        )
    else:
        # find student's batches
        enrollments = query(
            "SELECT batch_id FROM batch_enrollment WHERE student_id=%s",
            (request.user_id,), fetchall=True
        )
        batch_ids = [str(e["batch_id"]) for e in (enrollments or [])]
        if not batch_ids:
            return jsonify([])
        placeholders = ",".join(["%s"] * len(batch_ids))
        rows = query(
            f"""SELECT q.*, b.name AS batch_name
                FROM quiz q
                LEFT JOIN batch b ON b.batch_id = q.batch_id
                WHERE q.batch_id IN ({placeholders}) AND q.status='live'
                ORDER BY q.start_time""",
            batch_ids, fetchall=True
        )

    result = []
    for r in (rows or []):
        r = dict(r)
        r["quiz_id"] = str(r["quiz_id"])
        # question count
        qc = query("SELECT COUNT(*) AS cnt FROM question WHERE quiz_id=%s",
                   (r["quiz_id"],), fetchone=True)
        r["questions"] = qc["cnt"] if qc else 0
        # attempt count
        ac = query("SELECT COUNT(*) AS cnt FROM quiz_attempt WHERE quiz_id=%s",
                   (r["quiz_id"],), fetchone=True)
        r["attempts"] = ac["cnt"] if ac else 0
        # avg score
        avg = query("SELECT AVG(score) AS avg FROM quiz_attempt WHERE quiz_id=%s AND status='completed'",
                    (r["quiz_id"],), fetchone=True)
        r["avg_score"] = round(float(avg["avg"]), 1) if avg and avg["avg"] else 0
        result.append(r)
    return jsonify(result)


@app.route("/api/quizzes", methods=["POST"])
@require_auth(roles=["TEACHER", "ADMIN"])
def create_quiz():
    d = request.json or {}
    quiz_id = str(uuid.uuid4())
    query(
        """INSERT INTO quiz
            (quiz_id, title, subject, created_by, batch_id, duration, total_marks,
             start_time, end_time, status, difficulty, instructions,
             setting_fullscreen, setting_random_q, setting_random_opts,
             setting_copy_paste, setting_tab_detect)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (quiz_id, d.get("title"), d.get("subject"), request.user_id,
         d.get("batch_id"), d.get("duration", 30), d.get("total_marks", 0),
         d.get("available_from"), d.get("available_until"),
         d.get("status", "draft"), d.get("difficulty", "medium"),
         d.get("instructions"),
         d.get("settings", {}).get("fullscreen", True),
         d.get("settings", {}).get("randomQ", True),
         d.get("settings", {}).get("randomOpts", False),
         d.get("settings", {}).get("copyPaste", True),
         d.get("settings", {}).get("tabDetect", True)),
        commit=True
    )
    return jsonify({"quiz_id": quiz_id}), 201


@app.route("/api/quizzes/<quiz_id>", methods=["PUT"])
@require_auth(roles=["TEACHER", "ADMIN"])
def update_quiz(quiz_id):
    d = request.json or {}
    query(
        """UPDATE quiz SET
            title=%s, subject=%s, batch_id=%s, duration=%s, total_marks=%s,
            start_time=%s, end_time=%s, status=%s, instructions=%s,
            setting_fullscreen=%s, setting_random_q=%s, setting_random_opts=%s,
            setting_copy_paste=%s, setting_tab_detect=%s
           WHERE quiz_id=%s AND created_by=%s""",
        (d.get("title"), d.get("subject"), d.get("batch_id"),
         d.get("duration", 30), d.get("total_marks", 0),
         d.get("available_from"), d.get("available_until"),
         d.get("status", "draft"), d.get("instructions"),
         d.get("settings", {}).get("fullscreen", True),
         d.get("settings", {}).get("randomQ", True),
         d.get("settings", {}).get("randomOpts", False),
         d.get("settings", {}).get("copyPaste", True),
         d.get("settings", {}).get("tabDetect", True),
         quiz_id, request.user_id),
        commit=True
    )
    return jsonify({"ok": True})


@app.route("/api/quizzes/<quiz_id>", methods=["DELETE"])
@require_auth(roles=["TEACHER", "ADMIN"])
def delete_quiz(quiz_id):
    query("DELETE FROM quiz WHERE quiz_id=%s AND created_by=%s",
          (quiz_id, request.user_id), commit=True)
    return jsonify({"ok": True})


@app.route("/api/quizzes/<quiz_id>/duplicate", methods=["POST"])
@require_auth(roles=["TEACHER", "ADMIN"])
def duplicate_quiz(quiz_id):
    orig = query("SELECT * FROM quiz WHERE quiz_id=%s", (quiz_id,), fetchone=True)
    if not orig:
        return jsonify({"error": "Not found"}), 404
    new_id = str(uuid.uuid4())
    query(
        """INSERT INTO quiz
            (quiz_id, title, subject, created_by, batch_id, duration, total_marks,
             start_time, end_time, status, difficulty, instructions,
             setting_fullscreen, setting_random_q, setting_random_opts,
             setting_copy_paste, setting_tab_detect)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,'draft',%s,%s,%s,%s,%s,%s,%s)""",
        (new_id, orig["title"] + " (Copy)", orig["subject"], request.user_id,
         orig["batch_id"], orig["duration"], orig["total_marks"],
         orig["start_time"], orig["end_time"],
         orig["difficulty"], orig["instructions"],
         orig["setting_fullscreen"], orig["setting_random_q"],
         orig["setting_random_opts"], orig["setting_copy_paste"],
         orig["setting_tab_detect"]),
        commit=True
    )
    # duplicate questions
    questions = query("SELECT * FROM question WHERE quiz_id=%s", (quiz_id,), fetchall=True)
    for q in (questions or []):
        new_q_id = str(uuid.uuid4())
        query(
            """INSERT INTO question
                (question_id, quiz_id, question_text, type, topic, marks, difficulty,
                 image_data, expected_answer, keywords, evaluation_mode,
                 problem_title, problem_description, constraints_text,
                 sample_input, sample_output, starter_code, tags, subtopic)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
            (new_q_id, new_id, q["question_text"], q["type"], q["topic"],
             q["marks"], q["difficulty"], q["image_data"], q["expected_answer"],
             q["keywords"], q["evaluation_mode"], q["problem_title"],
             q["problem_description"], q["constraints_text"], q["sample_input"],
             q["sample_output"], q["starter_code"], q["tags"], q["subtopic"]),
            commit=True
        )
        # duplicate options
        options = query("SELECT * FROM option_choice WHERE question_id=%s",
                        (str(q["question_id"]),), fetchall=True)
        for opt in (options or []):
            query(
                "INSERT INTO option_choice (question_id, option_text, is_correct, display_order) VALUES (%s,%s,%s,%s)",
                (new_q_id, opt["option_text"], opt["is_correct"], opt["display_order"]),
                commit=True
            )
    return jsonify({"quiz_id": new_id}), 201


# ═══════════════════════════════════════════════════════════════════════════════
# QUESTIONS
# ═══════════════════════════════════════════════════════════════════════════════
@app.route("/api/quizzes/<quiz_id>/questions", methods=["GET", "POST"])
@require_auth()
def questions_handler(quiz_id):
    if request.method == "GET":
        questions = query(
            "SELECT * FROM question WHERE quiz_id=%s ORDER BY created_at",
            (quiz_id,), fetchall=True
        )
        result = []
        for q in (questions or []):
            q = dict(q)
            q["question_id"] = str(q["question_id"])
            if q["quiz_id"]:
                q["quiz_id"] = str(q["quiz_id"])
            if q["type"] == "mcq":
                opts = query(
                    """SELECT option_id, option_text, is_correct, display_order
                       FROM option_choice WHERE question_id=%s ORDER BY display_order""",
                    (q["question_id"],), fetchall=True
                )
                q["options"] = [
                    {
                        "option_id": str(o["option_id"]),
                        "option_text": o["option_text"],
                        "is_correct": o["is_correct"],
                        "display_order": o["display_order"],
                    }
                    for o in (opts or [])
                ]
            if q["type"] == "coding":
                tcs = query(
                    """SELECT testcase_id, input_data, expected_output, is_hidden, display_order
                       FROM coding_testcase WHERE question_id=%s ORDER BY display_order""",
                    (q["question_id"],), fetchall=True
                )
                q["test_cases"] = [
                    {
                        "testcase_id": str(t["testcase_id"]),
                        "input_data": t["input_data"],
                        "expected_output": t["expected_output"],
                        "is_hidden": t["is_hidden"],
                        "display_order": t["display_order"],
                    }
                    for t in (tcs or [])
                ]
            result.append(q)
        return jsonify(result)

    # POST — teacher adds a question
    if request.user_role not in ("TEACHER", "ADMIN"):
        return jsonify({"error": "Forbidden"}), 403

    d = request.json or {}
    q_id = str(uuid.uuid4())

    query(
        """INSERT INTO question
            (question_id, quiz_id, question_text, type, topic, marks, difficulty,
             image_data, expected_answer, keywords, evaluation_mode,
             problem_title, problem_description, constraints_text,
             sample_input, sample_output, starter_code, tags, subtopic)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (q_id, quiz_id,
         d.get("questionText"),
         d.get("type", "mcq"),
         d.get("topic"),
         d.get("marks", 1),
         d.get("difficulty", "medium"),
         d.get("imageData"),
         d.get("expectedAnswer"),
         d.get("keywords"),
         d.get("evaluationMode", "manual"),
         d.get("problemTitle"),
         d.get("problemDescription"),
         d.get("constraints"),
         d.get("sampleInput"),
         d.get("sampleOutput"),
         d.get("starterCode"),
         d.get("tags"),
         d.get("subtopic")),
        commit=True
    )

    if d.get("type") == "mcq":
        for i, opt in enumerate(d.get("options", [])):
            query(
                """INSERT INTO option_choice
                   (question_id, option_text, is_correct, display_order)
                   VALUES (%s,%s,%s,%s)""",
                (q_id, opt, i == d.get("correctOption", 0), i),
                commit=True
            )

    if d.get("type") == "coding":
        for i, tc in enumerate(d.get("testCasesParsed", [])):
            query(
                """INSERT INTO coding_testcase
                   (question_id, input_data, expected_output, is_hidden, display_order)
                   VALUES (%s,%s,%s,%s,%s)""",
                (q_id,
                 tc.get("input", ""),
                 tc.get("expected", ""),
                 tc.get("hidden", True),
                 i),
                commit=True
            )

    query(
        """UPDATE quiz
           SET total_marks = (SELECT COALESCE(SUM(marks),0) FROM question WHERE quiz_id=%s)
           WHERE quiz_id=%s""",
        (quiz_id, quiz_id), commit=True
    )

    return jsonify({"question_id": q_id}), 201




@app.route("/api/questions/<question_id>", methods=["DELETE"])
@require_auth(roles=["TEACHER", "ADMIN"])
def delete_question(question_id):
    query("DELETE FROM question WHERE question_id=%s", (question_id,), commit=True)
    return jsonify({"ok": True})


# ═══════════════════════════════════════════════════════════════════════════════
# QUIZ ATTEMPTS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/quizzes/<quiz_id>/attempt/start", methods=["POST"])
@require_auth(roles=["STUDENT"])
def start_attempt(quiz_id):
    # check existing
    existing = query(
        "SELECT attempt_id, status FROM quiz_attempt WHERE quiz_id=%s AND student_id=%s",
        (quiz_id, request.user_id), fetchone=True
    )
    if existing and existing["status"] == "completed":
        return jsonify({"error": "Already submitted"}), 409
    if existing:
        return jsonify({"attempt_id": str(existing["attempt_id"]), "resumed": True})

    attempt_id = str(uuid.uuid4())
    query(
        "INSERT INTO quiz_attempt (attempt_id, quiz_id, student_id) VALUES (%s,%s,%s)",
        (attempt_id, quiz_id, request.user_id), commit=True
    )
    return jsonify({"attempt_id": attempt_id, "resumed": False}), 201

@app.route("/api/student/attempts", methods=["GET"])
@require_auth(roles=["STUDENT"])
def student_attempts():
    rows = query(
        """SELECT
              qa.attempt_id,
              qa.quiz_id,
              qa.student_id,
              qa.status,
              qa.score,
              qa.submit_time,
              (
                SELECT COALESCE(SUM(qmarks.marks), 0)
                FROM question qmarks
                WHERE qmarks.quiz_id = qa.quiz_id
              ) AS max_score,
              (
                SELECT COUNT(*)
                FROM question qcount
                WHERE qcount.quiz_id = qa.quiz_id
              ) AS total_questions,
              (
                SELECT COUNT(DISTINCT aa.question_id)
                FROM attempt_answer aa
                WHERE aa.attempt_id = qa.attempt_id
              ) AS answered_count
           FROM quiz_attempt qa
           WHERE qa.student_id = %s
           ORDER BY qa.submit_time DESC NULLS LAST""",
        (request.user_id,),
        fetchall=True
    )

    return jsonify([
        {
            "id": str(r["attempt_id"]),
            "quizId": str(r["quiz_id"]),
            "studentId": str(r["student_id"]),
            "status": r["status"],
            "score": float(r["score"] or 0),
            "maxScore": float(r["max_score"] or 0),
            "answeredCount": int(r["answered_count"] or 0),
            "totalQuestions": int(r["total_questions"] or 0),
            "submittedAt": r["submit_time"].isoformat() if r["submit_time"] else "",
            "evaluated": r["status"] == "completed",
            "finalScore": float(r["score"] or 0),
        }
        for r in rows
    ])
@app.route("/api/teacher/attempts", methods=["GET"])
@require_auth(roles=["TEACHER", "ADMIN"])
def teacher_attempts():
    rows = query(
        """SELECT
              qa.attempt_id,
              qa.quiz_id,
              qa.student_id,
              qa.status,
              qa.score,
              qa.submit_time,
              q.title AS quiz_title,
              u.name AS student_name,
              u.email AS student_email,
              (
  SELECT COALESCE(SUM(qmarks.marks), 0)
  FROM question qmarks
  WHERE qmarks.quiz_id = q.quiz_id
) AS max_score,
(
  SELECT COUNT(*)
  FROM question qcount
  WHERE qcount.quiz_id = q.quiz_id
) AS total_questions,
COUNT(DISTINCT aa.question_id) AS answered_count
           FROM quiz_attempt qa
           JOIN quiz q ON q.quiz_id = qa.quiz_id
           JOIN users u ON u.user_id = qa.student_id
           
           LEFT JOIN attempt_answer aa ON aa.attempt_id = qa.attempt_id
           WHERE q.created_by = %s
           GROUP BY
              qa.attempt_id,
              qa.quiz_id,
              qa.student_id,
              qa.status,
              qa.score,
              qa.submit_time,
              q.quiz_id,
              q.title,
              u.name,
              u.email
           ORDER BY qa.submit_time DESC NULLS LAST""",
        (request.user_id,),
        fetchall=True
    )

    result = []

    for r in rows:
        answer_rows = query(
            """SELECT
                  qu.question_id,
                  qu.type,
                  aa.answer_text,
                  oc.display_order AS selected_index
               FROM question qu
               LEFT JOIN attempt_answer aa
                    ON aa.question_id = qu.question_id
                   AND aa.attempt_id = %s
               LEFT JOIN option_choice oc
                    ON oc.option_id = aa.selected_option
               WHERE qu.quiz_id = %s
               ORDER BY qu.created_at""",
            (r["attempt_id"], r["quiz_id"]),
            fetchall=True
        )

        answers = []
        for a in answer_rows:
            if a["type"] == "mcq":
                answers.append(a["selected_index"])
            else:
                answers.append(a["answer_text"] or "")

        result.append({
            "id": str(r["attempt_id"]),
            "quizId": str(r["quiz_id"]),
            "studentId": str(r["student_id"]),
            "studentName": r["student_name"],
            "studentEmail": r["student_email"],
            "quizTitle": r["quiz_title"],
            "status": r["status"],
            "score": float(r["score"] or 0),
            "maxScore": float(r["max_score"] or 0),
            "answeredCount": int(r["answered_count"] or 0),
            "totalQuestions": int(r["total_questions"] or 0),
            "submittedAt": r["submit_time"].isoformat() if r["submit_time"] else "",
            "evaluated": r["status"] == "completed",
            "finalScore": float(r["score"] or 0),
            "answers": answers,
        })

    return jsonify(result)

@app.route("/api/attempts/<attempt_id>/answer", methods=["POST"])
@require_auth(roles=["STUDENT"])
def save_answer(attempt_id):
    """Save/update one answer. Body: { question_id, selected_option?, answer_text? }"""
    d = request.json or {}
    question_id     = d.get("question_id")
    selected_option = d.get("selected_option")   # option UUID for MCQ
    answer_text     = d.get("answer_text")        # text for short/coding

    # check correctness for MCQ automatically
    is_correct    = None
    marks_awarded = 0
    if selected_option:
        opt = query("SELECT is_correct FROM option_choice WHERE option_id=%s",
                    (selected_option,), fetchone=True)
        if opt:
            is_correct = opt["is_correct"]
            if is_correct:
                q = query("SELECT marks FROM question WHERE question_id=%s",
                          (question_id,), fetchone=True)
                marks_awarded = q["marks"] if q else 0

    query(
        """INSERT INTO attempt_answer
            (attempt_id, question_id, selected_option, answer_text, is_correct, marks_awarded)
           VALUES (%s,%s,%s,%s,%s,%s)
           ON CONFLICT (attempt_id, question_id)
           DO UPDATE SET selected_option=%s, answer_text=%s, is_correct=%s, marks_awarded=%s""",
        (attempt_id, question_id, selected_option, answer_text, is_correct, marks_awarded,
         selected_option, answer_text, is_correct, marks_awarded),
        commit=True
    )
    return jsonify({"ok": True, "is_correct": is_correct, "marks_awarded": marks_awarded})


@app.route("/api/attempts/<attempt_id>/submit", methods=["POST"])
@require_auth(roles=["STUDENT"])
def submit_attempt(attempt_id):
    """Auto-calculate score and mark as completed."""
    total = query(
        "SELECT COALESCE(SUM(marks_awarded),0) AS total FROM attempt_answer WHERE attempt_id=%s",
        (attempt_id,), fetchone=True
    )
    score = float(total["total"]) if total else 0

    query(
        "UPDATE quiz_attempt SET status='completed', submit_time=NOW(), score=%s WHERE attempt_id=%s",
        (score, attempt_id), commit=True
    )
    return jsonify({"ok": True, "score": score})


@app.route("/api/attempts/<attempt_id>/violation", methods=["POST"])
@require_auth(roles=["STUDENT"])
def record_violation(attempt_id):
    """Increment tab-switch count."""
    row = query(
        "UPDATE quiz_attempt SET violations = violations+1 WHERE attempt_id=%s RETURNING violations",
        (attempt_id,), fetchone=True
    )
    if row:
        # auto-flag if > 3
        violations = row["violations"]
        if violations >= 3:
            query("UPDATE quiz_attempt SET status='flagged' WHERE attempt_id=%s",
                  (attempt_id,), commit=True)
        else:
            query("UPDATE quiz_attempt SET violations=%s WHERE attempt_id=%s",
                  (violations, attempt_id), commit=True)
        return jsonify({"violations": violations, "flagged": violations >= 3})
    return jsonify({"error": "Attempt not found"}), 404


# ═══════════════════════════════════════════════════════════════════════════════
# CODING / JUDGE0 PROXY
# ═══════════════════════════════════════════════════════════════════════════════

LANG_MAP = {"python": 71, "cpp": 54, "java": 62, "c": 50}


@app.route("/run", methods=["POST", "OPTIONS"])
def run_code():
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "POST,OPTIONS")
        return response, 204
    try:
        d = request.json or {}
        code = d.get("code", "") or ""
        lang_id = int(d.get("language_id", 71))
        stdin = d.get("stdin") or ""
        resp = requests.post(
            "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
            json={"source_code": code, "language_id": lang_id, "stdin": stdin or None},
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        result = resp.json()
        stdout = result.get("stdout") or ""
        stderr = result.get("stderr") or ""
        compile_out = result.get("compile_output") or ""
        status = result.get("status", {}).get("description", "")
        output = stdout or stderr or compile_out or ""
        response = jsonify({"output": output.strip(), "verdict": status, "stdout": stdout.strip()})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    except Exception as e:
        response = jsonify({"output": "", "error": str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500


@app.route("/submit", methods=["POST", "OPTIONS"])
def submit_code():
    if request.method == "OPTIONS":
        return "", 204
    d = request.json or {}
    code      = d.get("code", "")
    lang_id   = d.get("language_id", 71)
    test_cases = d.get("test_cases", [])
    attempt_id = d.get("attempt_id")
    question_id = d.get("question_id")

    results = []
    all_pass = True

    for tc in test_cases:
        try:
            resp = requests.post(
             f"{JUDGE0_URL}/submissions?base64_encoded=false&wait=true",
            json={"source_code": code, "language_id": lang_id, "stdin": tc.get("input", "")},
            headers={"Content-Type": "application/json"},
            timeout=15
            )
            result = resp.json()
            stdout = (result.get("stdout") or "").strip()
            expected = (tc.get("expected") or "").strip()
            passed = stdout == expected
            if not passed:
                all_pass = False
            results.append({
                "id": tc.get("id", 1),
                "pass": passed,
                "got": stdout,
                "expected": expected,
                "time": result.get("time"),
                "error": result.get("stderr") or result.get("compile_output") or None,
            })
        except Exception as e:
            all_pass = False
            results.append({"id": tc.get("id", 1), "pass": False, "error": str(e)})

    verdict = "Accepted" if all_pass else "Wrong Answer"

    # log submission to DB if we have attempt context
    if attempt_id and question_id:
        lang_name = {v: k for k, v in LANG_MAP.items()}.get(lang_id, "unknown")
        try:
            query(
                """INSERT INTO submission_log
                    (attempt_id, question_id, student_id, code, language, language_id, runtime_status)
                   SELECT %s, %s, student_id, %s, %s, %s, %s
                   FROM quiz_attempt WHERE attempt_id=%s""",
                (attempt_id, question_id, code, lang_name, lang_id, verdict, attempt_id),
                commit=True
            )
        except Exception:
            pass  # don't fail submission if logging fails

    return jsonify({"verdict": verdict, "test_results": results})


# ═══════════════════════════════════════════════════════════════════════════════
# ANALYTICS
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/api/analytics/teacher", methods=["GET"])
@require_auth(roles=["TEACHER", "ADMIN"])
def teacher_analytics():
    # avg score across all quizzes by this teacher
    avg = query(
        """SELECT AVG(qa.score) AS avg_score, COUNT(qa.attempt_id) AS total_attempts
           FROM quiz_attempt qa
           JOIN quiz q ON q.quiz_id = qa.quiz_id
           WHERE q.created_by=%s AND qa.status='completed'""",
        (request.user_id,), fetchone=True
    )
    # cheating flags
    flags = query(
        """SELECT COUNT(*) AS cnt FROM quiz_attempt qa
           JOIN quiz q ON q.quiz_id = qa.quiz_id
           WHERE q.created_by=%s AND qa.status='flagged'""",
        (request.user_id,), fetchone=True
    )
    return jsonify({
        "avg_score":      round(float(avg["avg_score"]), 1) if avg and avg["avg_score"] else 0,
        "total_attempts": int(avg["total_attempts"]) if avg else 0,
        "cheating_flags": int(flags["cnt"]) if flags else 0,
    })


@app.route("/api/analytics/student", methods=["GET"])
@require_auth(roles=["STUDENT"])
def student_analytics():
    stats = query(
        """SELECT COUNT(*) AS total, AVG(score) AS avg_score
           FROM quiz_attempt WHERE student_id=%s AND status='completed'""",
        (request.user_id,), fetchone=True
    )
    recent = query(
        """SELECT q.title, qa.score, qa.submit_time
           FROM quiz_attempt qa JOIN quiz q ON q.quiz_id=qa.quiz_id
           WHERE qa.student_id=%s AND qa.status='completed'
           ORDER BY qa.submit_time DESC LIMIT 5""",
        (request.user_id,), fetchall=True
    )
    return jsonify({
        "total_quizzes": int(stats["total"]) if stats else 0,
        "avg_score":     round(float(stats["avg_score"]), 1) if stats and stats["avg_score"] else 0,
        "recent":        [dict(r) for r in (recent or [])],
    })


# ═══════════════════════════════════════════════════════════════════════════════
# HEALTH
# ═══════════════════════════════════════════════════════════════════════════════

@app.route("/health", methods=["GET"])
def health():
    try:
        query("SELECT 1", fetchone=True)
        return jsonify({"status": "ok", "db": "connected"})
    except Exception as e:
        return jsonify({"status": "error", "db": str(e)}), 500


# ─── Run ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=8000)