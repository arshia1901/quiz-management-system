-- ============================================================
-- Examify.ai — PostgreSQL Schema
-- Run this once: psql -U postgres -d examify -f schema.sql
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_uuid()

-- ─── 1. Users (base table) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    user_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(120) NOT NULL,
    email       VARCHAR(200) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,              -- bcrypt hash stored here
    role        VARCHAR(20) NOT NULL CHECK (role IN ('STUDENT','TEACHER','ADMIN')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. Student Profile ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_profile (
    student_id  UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    roll_number VARCHAR(30),
    department  VARCHAR(100),
    semester    INT,
    year        INT
);

-- ─── 3. Teacher Profile ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teacher_profile (
    teacher_id  UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    department  VARCHAR(100),
    designation VARCHAR(80)
);

-- ─── 4. Batches ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS batch (
    batch_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,       -- e.g. "ISE A"
    department      VARCHAR(100),
    semester        VARCHAR(50),
    academic_year   VARCHAR(20),                 -- e.g. "2024-2025"
    subject         VARCHAR(120),
    created_by      UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 5. Batch Enrollment (many-to-many: students ↔ batches) ─────────────────
CREATE TABLE IF NOT EXISTS batch_enrollment (
    batch_id    UUID NOT NULL REFERENCES batch(batch_id) ON DELETE CASCADE,
    student_id  UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (batch_id, student_id)
);

-- ─── 6. Quiz ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz (
    quiz_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(200) NOT NULL,
    subject         VARCHAR(80),
    created_by      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    batch_id        UUID REFERENCES batch(batch_id) ON DELETE SET NULL,
    duration        INT NOT NULL DEFAULT 30,     -- minutes
    total_marks     INT NOT NULL DEFAULT 0,
    start_time      TIMESTAMPTZ,
    end_time        TIMESTAMPTZ,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft','live','closed')),
    difficulty      VARCHAR(10) NOT NULL DEFAULT 'medium'
                        CHECK (difficulty IN ('easy','medium','hard')),
    instructions    TEXT,
    -- anti-cheat settings (stored as booleans)
    setting_fullscreen   BOOLEAN NOT NULL DEFAULT TRUE,
    setting_random_q     BOOLEAN NOT NULL DEFAULT TRUE,
    setting_random_opts  BOOLEAN NOT NULL DEFAULT FALSE,
    setting_copy_paste   BOOLEAN NOT NULL DEFAULT TRUE,
    setting_tab_detect   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 7. Questions ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question (
    question_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id         UUID REFERENCES quiz(quiz_id) ON DELETE CASCADE,
    question_text   TEXT,
    type            VARCHAR(10) NOT NULL CHECK (type IN ('mcq','short','coding','image')),
    topic           VARCHAR(120),
    marks           INT NOT NULL DEFAULT 1,
    difficulty      VARCHAR(10) DEFAULT 'medium'
                        CHECK (difficulty IN ('easy','medium','hard')),
    image_data      TEXT,            -- base64 data URI (optional)
    -- short-answer fields
    expected_answer TEXT,
    keywords        TEXT,            -- comma-separated
    evaluation_mode VARCHAR(10) DEFAULT 'manual' CHECK (evaluation_mode IN ('manual','nlp')),
    -- coding fields
    problem_title       VARCHAR(200),
    problem_description TEXT,
    constraints_text    TEXT,
    sample_input        TEXT,
    sample_output       TEXT,
    starter_code        TEXT,
    -- pool fields
    tags            TEXT,            -- comma-separated tags
    subtopic        VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 8. MCQ Options ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS option_choice (
    option_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id     UUID NOT NULL REFERENCES question(question_id) ON DELETE CASCADE,
    option_text     TEXT NOT NULL,
    is_correct      BOOLEAN NOT NULL DEFAULT FALSE,
    display_order   INT NOT NULL DEFAULT 0
);

-- ─── 9. Coding Test Cases ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coding_testcase (
    testcase_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id     UUID NOT NULL REFERENCES question(question_id) ON DELETE CASCADE,
    input_data      TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_hidden       BOOLEAN NOT NULL DEFAULT TRUE,
    display_order   INT NOT NULL DEFAULT 0
);

-- ─── 10. Quiz Attempts ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_attempt (
    attempt_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id         UUID NOT NULL REFERENCES quiz(quiz_id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    start_time      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submit_time     TIMESTAMPTZ,
    score           NUMERIC(6,2),
    status          VARCHAR(20) NOT NULL DEFAULT 'in-progress'
                        CHECK (status IN ('in-progress','completed','flagged')),
    violations      INT NOT NULL DEFAULT 0,      -- tab-switch count
    UNIQUE (quiz_id, student_id)                 -- one attempt per student per quiz
);

-- ─── 11. Attempt Answers ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attempt_answer (
    answer_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id      UUID NOT NULL REFERENCES quiz_attempt(attempt_id) ON DELETE CASCADE,
    question_id     UUID NOT NULL REFERENCES question(question_id) ON DELETE CASCADE,
    selected_option UUID REFERENCES option_choice(option_id),  -- MCQ
    answer_text     TEXT,                                       -- short / coding
    is_correct      BOOLEAN,
    marks_awarded   NUMERIC(5,2) NOT NULL DEFAULT 0,
    UNIQUE (attempt_id, question_id)
);

-- ─── 12. Submission Logs (Judge0 / code runs) ────────────────────────────────
CREATE TABLE IF NOT EXISTS submission_log (
    log_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id      UUID REFERENCES quiz_attempt(attempt_id) ON DELETE CASCADE,
    question_id     UUID NOT NULL REFERENCES question(question_id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    code            TEXT NOT NULL,
    language        VARCHAR(20) NOT NULL,        -- python / cpp / java / c
    language_id     INT,                         -- Judge0 language ID
    runtime_status  VARCHAR(40),                 -- Accepted / WA / TLE / RE / CE
    execution_time  NUMERIC(8,3),               -- seconds
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_question_quiz    ON question(quiz_id);
CREATE INDEX IF NOT EXISTS idx_option_question  ON option_choice(question_id);
CREATE INDEX IF NOT EXISTS idx_attempt_quiz     ON quiz_attempt(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempt_student  ON quiz_attempt(student_id);
CREATE INDEX IF NOT EXISTS idx_answer_attempt   ON attempt_answer(attempt_id);
CREATE INDEX IF NOT EXISTS idx_log_attempt      ON submission_log(attempt_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_batch ON batch_enrollment(batch_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_stu   ON batch_enrollment(student_id);
CREATE INDEX IF NOT EXISTS idx_testcase_q       ON coding_testcase(question_id);    