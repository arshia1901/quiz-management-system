/**
 * mobile/src/api.ts
 * Mirrors client/src/api.js — same endpoints, same JWT Bearer auth.
 * Uses AsyncStorage instead of localStorage.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./config";

const TOKEN_KEY = "examify_token";

export async function getToken(): Promise<string> {
  return (await AsyncStorage.getItem(TOKEN_KEY)) || "";
}

export async function setToken(token: string | null) {
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}

async function request(method: string, path: string, body?: unknown) {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || `HTTP ${res.status}`);
  return data;
}

const api = {
  get: (path: string) => request("GET", path),
  post: (path: string, body: unknown) => request("POST", path, body),
  put: (path: string, body: unknown) => request("PUT", path, body),
  delete: (path: string) => request("DELETE", path),
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string, role: string) =>
    api.post("/api/auth/login", { email, password, role }),
  register: (data: unknown) => api.post("/api/auth/register", data),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersAPI = {
  list: (role?: string) =>
    api.get(`/api/users${role ? `?role=${role}` : ""}`),
  deleteUser: (user_id: string) => api.delete(`/api/users/${user_id}`),
};

// ─── Batches ─────────────────────────────────────────────────────────────────
export const batchesAPI = {
  list: () => api.get("/api/batches"),
  create: (data: unknown) => api.post("/api/batches", data),
  delete: (batch_id: string) => api.delete(`/api/batches/${batch_id}`),
  enroll: (batch_id: string, student_id: string) =>
    api.post(`/api/batches/${batch_id}/enroll`, { student_id }),
  removeEnroll: (batch_id: string, student_id: string) =>
    api.delete(`/api/batches/${batch_id}/enroll/${student_id}`),
};

// ─── Quizzes ─────────────────────────────────────────────────────────────────
export const quizzesAPI = {
  list: () => api.get("/api/quizzes"),
  create: (data: unknown) => api.post("/api/quizzes", data),
  update: (id: string, data: unknown) => api.put(`/api/quizzes/${id}`, data),
  delete: (id: string) => api.delete(`/api/quizzes/${id}`),
  duplicate: (id: string) => api.post(`/api/quizzes/${id}/duplicate`, {}),
};

// ─── Questions ───────────────────────────────────────────────────────────────
export const questionsAPI = {
  list: (quiz_id: string) => api.get(`/api/quizzes/${quiz_id}/questions`),
  add: (quiz_id: string, data: unknown) =>
    api.post(`/api/quizzes/${quiz_id}/questions`, data),
  delete: (question_id: string) => api.delete(`/api/questions/${question_id}`),
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsAPI = {
  teacher: () => api.get("/api/analytics/teacher"),
  student: () => api.get("/api/analytics/student"),
};
