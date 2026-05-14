// client/src/utils/api.js
// ─────────────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("examify_token") || "";
}

export function setToken(token) {
  if (token) localStorage.setItem("examify_token", token);
  else        localStorage.removeItem("examify_token");
}

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  get:    (path)       => request("GET",    path),
  post:   (path, body) => request("POST",   path, body),
  put:    (path, body) => request("PUT",    path, body),
  delete: (path)       => request("DELETE", path),
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (email, password, role) =>
    api.post("/api/auth/login",    { email, password, role }),
  register: (data) =>
    api.post("/api/auth/register", data),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersAPI = {
  list:       (role)    => api.get(`/api/users${role ? `?role=${role}` : ""}`),
  deleteUser: (user_id) => api.delete(`/api/users/${user_id}`),
};

// ─── Batches ─────────────────────────────────────────────────────────────────
export const batchesAPI = {
  list:         ()                       => api.get("/api/batches"),
  create:       (data)                   => api.post("/api/batches", data),
  delete:       (batch_id)               => api.delete(`/api/batches/${batch_id}`),
  enroll:       (batch_id, student_id)   => api.post(`/api/batches/${batch_id}/enroll`, { student_id }),
  removeEnroll: (batch_id, student_id)   => api.delete(`/api/batches/${batch_id}/enroll/${student_id}`),
};

// ─── Quizzes ─────────────────────────────────────────────────────────────────
export const quizzesAPI = {
  list:      ()         => api.get("/api/quizzes"),
  create:    (data)     => api.post("/api/quizzes", data),
  update:    (id, data) => api.put(`/api/quizzes/${id}`, data),
  delete:    (id)       => api.delete(`/api/quizzes/${id}`),
  duplicate: (id)       => api.post(`/api/quizzes/${id}/duplicate`, {}),
};

// ─── Questions ───────────────────────────────────────────────────────────────
export const questionsAPI = {
  list:   (quiz_id)       => api.get(`/api/quizzes/${quiz_id}/questions`),
  add:    (quiz_id, data) => api.post(`/api/quizzes/${quiz_id}/questions`, data),
  delete: (question_id)   => api.delete(`/api/questions/${question_id}`),
};

// ─── Attempts ────────────────────────────────────────────────────────────────
export const attemptsAPI = {
  /**
   * Start or resume an attempt.
   * Returns { attempt_id, resumed, seconds_left, server_deadline, settings }
   */
  start: (quiz_id) =>
    api.post(`/api/quizzes/${quiz_id}/attempt/start`, {}),

  /**
   * Poll this every ~10 s to get authoritative time remaining.
   * Returns { status, seconds_left, auto_submitted? }
   */
  syncTimer: (attempt_id) =>
    api.get(`/api/attempts/${attempt_id}/sync-timer`),

  saveAnswer: (attempt_id, data) =>
    api.post(`/api/attempts/${attempt_id}/answer`, data),

  submit: (attempt_id) =>
    api.post(`/api/attempts/${attempt_id}/submit`, {}),

  /**
   * Log a security event.
   * violation_type: 'tab_switch' | 'window_blur' | 'fullscreen_exit' |
   *                 'copy_paste' | 'right_click' | 'keyboard_shortcut' |
   *                 'idle_timeout' | 'code_run' | 'code_submit' | 'question_time'
   */
  violation: (attempt_id, violation_type, detail = "") =>
    api.post(`/api/attempts/${attempt_id}/violation`, { violation_type, detail }),

  /**
   * Log time spent on a question (called when navigating away).
   */
  logQuestionTime: (attempt_id, question_id, time_spent_ms) =>
    api.post(`/api/attempts/${attempt_id}/question-time`, { question_id, time_spent_ms }),
};

// ─── Violation review (teacher) ───────────────────────────────────────────────
export const violationsAPI = {
  /** All violations for a quiz, grouped by student */
  forQuiz:    (quiz_id)    => api.get(`/api/quizzes/${quiz_id}/violations`),
  /** Detailed log + question-time for one attempt */
  forAttempt: (attempt_id) => api.get(`/api/attempts/${attempt_id}/violations`),
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsAPI = {
  teacher: () => api.get("/api/analytics/teacher"),
  student: () => api.get("/api/analytics/student"),
};

// ─── Code execution (direct to Flask) ────────────────────────────────────────
export const codeAPI = {
  run: (code, language_id, stdin) =>
    fetch(`${BASE}/run`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ code, language_id, stdin }),
    }).then((r) => r.json()),

  submit: (code, language_id, test_cases, question_id, attempt_id) =>
    fetch(`${BASE}/submit`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ code, language_id, test_cases, question_id, attempt_id }),
    }).then((r) => r.json()),
};