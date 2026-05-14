-- ============================================================
-- Examify.ai — Security Features Migration
-- Run: psql -U postgres -d examify -f schema_migration.sql
-- ============================================================

-- ─── Add server-side timer columns to quiz_attempt ───────────────────────────
ALTER TABLE quiz_attempt
  ADD COLUMN IF NOT EXISTS server_start_time  TIMESTAMPTZ,   -- set on first open
  ADD COLUMN IF NOT EXISTS server_deadline    TIMESTAMPTZ,   -- start + duration
  ADD COLUMN IF NOT EXISTS time_spent_seconds INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS auto_submitted     BOOLEAN NOT NULL DEFAULT FALSE;

-- ─── Violation Log (per event, not just a count) ─────────────────────────────
CREATE TABLE IF NOT EXISTS violation_log (
    log_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id      UUID NOT NULL REFERENCES quiz_attempt(attempt_id) ON DELETE CASCADE,
    student_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    quiz_id         UUID NOT NULL REFERENCES quiz(quiz_id) ON DELETE CASCADE,
    violation_type  VARCHAR(40) NOT NULL
                        CHECK (violation_type IN (
                            'tab_switch',
                            'window_blur',
                            'fullscreen_exit',
                            'copy_paste',
                            'right_click',
                            'keyboard_shortcut',
                            'idle_timeout',
                            'code_run',
                            'code_submit',
                            'question_time'
                        )),
    detail          TEXT,                   -- extra context (e.g. idle seconds, shortcut used)
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Per-question time tracking ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_time_log (
    log_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id      UUID NOT NULL REFERENCES quiz_attempt(attempt_id) ON DELETE CASCADE,
    question_id     UUID NOT NULL REFERENCES question(question_id) ON DELETE CASCADE,
    time_spent_ms   INT NOT NULL DEFAULT 0,
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (attempt_id, question_id)          -- upsert-able
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_violation_attempt  ON violation_log(attempt_id);
CREATE INDEX IF NOT EXISTS idx_violation_student  ON violation_log(student_id);
CREATE INDEX IF NOT EXISTS idx_violation_quiz     ON violation_log(quiz_id);
CREATE INDEX IF NOT EXISTS idx_qtime_attempt      ON question_time_log(attempt_id);