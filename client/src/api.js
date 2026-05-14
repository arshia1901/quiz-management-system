// client/src/utils/api.js
// ─────────────────────────────────────────────────────────────────────────────
// Thin wrapper around fetch() that:
//   • automatically attaches the JWT from localStorage
//   • always sends/receives JSON
//   • throws on non-2xx so callers can .catch()
// ─────────────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("examify_token") || "";
}

export function setToken(token) {
  if (token) localStorage.setItem("examify_token", token);
  else localStorage.removeItem("examify_token");
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
  get:    (path)         => request("GET",    path),
  post:   (path, body)   => request("POST",   path, body),
  put:    (path, body)   => request("PUT",    path, body),
  delete: (path)         => request("DELETE", path),
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (email, password, role) =>
    api.post("/api/auth/login",    { email, password, role }),
  register: (data)                  =>
    api.post("/api/auth/register", data),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersAPI = {
  list:         (role)       => api.get(`/api/users${role ? `?role=${role}` : ""}`),
  deleteUser:   (user_id)    => api.delete(`/api/users/${user_id}`),
};

// ─── Batches ─────────────────────────────────────────────────────────────────
export const batchesAPI = {
  list:           ()            => api.get("/api/batches"),
  create:         (data)        => api.post("/api/batches", data),
  delete:         (batch_id)    => api.delete(`/api/batches/${batch_id}`),
  enroll:         (batch_id, student_id) =>
    api.post(`/api/batches/${batch_id}/enroll`, { student_id }),
  removeEnroll:   (batch_id, student_id) =>
    api.delete(`/api/batches/${batch_id}/enroll/${student_id}`),
};

// ─── Quizzes ─────────────────────────────────────────────────────────────────
export const quizzesAPI = {
  list:       ()           => api.get("/api/quizzes"),
  create:     (data)       => api.post("/api/quizzes", data),
  update:     (id, data)   => api.put(`/api/quizzes/${id}`, data),
  delete:     (id)         => api.delete(`/api/quizzes/${id}`),
  duplicate:  (id)         => api.post(`/api/quizzes/${id}/duplicate`, {}),
};

// ─── Questions ───────────────────────────────────────────────────────────────
export const questionsAPI = {
  list:   (quiz_id)        => api.get(`/api/quizzes/${quiz_id}/questions`),
  add:    (quiz_id, data)  => api.post(`/api/quizzes/${quiz_id}/questions`, data),
  delete: (question_id)    => api.delete(`/api/questions/${question_id}`),
};

// ─── Attempts ────────────────────────────────────────────────────────────────
export const attemptsAPI = {
  listMine:   ()                     => api.get("/api/student/attempts"),
  start:      (quiz_id)              => api.post(`/api/quizzes/${quiz_id}/attempt/start`, {}),
  saveAnswer: (attempt_id, data)     => api.post(`/api/attempts/${attempt_id}/answer`, data),
  submit:     (attempt_id)           => api.post(`/api/attempts/${attempt_id}/submit`, {}),
  violation:  (attempt_id)           => api.post(`/api/attempts/${attempt_id}/violation`, {}),
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsAPI = {
  teacher: () => api.get("/api/analytics/teacher"),
  student: () => api.get("/api/analytics/student"),
};

// ─── Code execution (direct to Flask, same server) ──────────────────────────
export const codeAPI = {
  run: (code, language_id, stdin) =>
    fetch(`${BASE}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language_id, stdin }),
    }).then((r) => r.json()),

  submit: (code, language_id, test_cases, question_id, attempt_id) =>
    fetch(`${BASE}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language_id, test_cases, question_id, attempt_id }),
    }).then((r) => r.json()),
};