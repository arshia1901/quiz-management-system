import { useState, useEffect, useRef, useCallback,useMemo  } from "react";
import {
  SAMPLE_QUIZZES,
  SAMPLE_STUDENTS,
  SAMPLE_USERS,
  SAMPLE_BATCHES,
  NOTIFS,
  SAMPLE_QUESTIONS,
  CODE_TEMPLATE,
} from "./data/sampleData";
import {
  getFromStorage,
  saveToStorage,
  removeFromStorage,
} from "./utils/storage";
import Editor from "@monaco-editor/react";

import axios from "axios";



// ─── Icons ─────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16, className = "" }) => {
  const icons = {
    home: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
    code: "M16 18l6-6-6-6 M8 6l-6 6 6 6",
    chart: "M18 20V10 M12 20V4 M6 20v-6",
    bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
    users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75 M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0",
    plus: "M12 5v14 M5 12h14",
    settings: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0 0v-4m0-8v4m-4 4H4m16 0h-4",
    logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
    check: "M20 6L9 17l-5-5",
    x: "M18 6L6 18 M6 6l12 12",
    flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7",
    clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-10V8 M12 12l3 1.5",
    play: "M5 3l14 9-14 9V3z",
    eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
    edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
    trash: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
    copy: "M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 0 2 2v1",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M17 11V7a5 5 0 0 0-10 0v4",
    cpu: "M9 3H5a2 2 0 0 0-2 2v4m6-6h6m-6 0v18m6-18h4a2 2 0 0 1 2 2v4m-6-6v18m0 0H9m6 0h4a2 2 0 0 0 2-2v-4M3 9v6m18-6v6M3 15h6m12 0h-6",
    arrow_right: "M5 12h14 M12 5l7 7-7 7",
    chevron_down: "M6 9l6 6 6-6",
    refresh: "M1 4v6h6 M23 20v-6h-6 M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15",
    image: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 0 2 2v10z",
    warning: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
    upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12",
    send: "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z",
    ai: "M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 0 2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1 0-2h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z",
    classroom: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    question: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01",
  };
  const d = icons[name] || icons.question;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {d.split(" M").map((seg, i) => <path key={i} d={(i === 0 ? "" : "M") + seg} />)}
    </svg>
  );
};



// ─── Components ────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }) {
  return (
    <div className="toggle-wrap">
      <label className="toggle">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
      {label && <span className="text-sm text-muted">{label}</span>}
    </div>
  );
}

function MiniBarChart({ data, height = 80 }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="chart-bar" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="chart-col">
          <div className="chart-bar-fill" style={{ height: `${(d.value / max) * 100}%`, background: d.color || "var(--accent)" }} title={d.value} />
          <span className="chart-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { live: ["badge-green", "● Live"], draft: ["badge-gray", "Draft"], closed: ["badge-amber", "Closed"], graded: ["badge-green", "Graded"], review: ["badge-amber", "Review"], cheating: ["badge-red", "⚠ Cheat"] };
  const [cls, label] = map[status] || ["badge-gray", status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

function DiffBadge({ diff }) {
  const map = { easy: "badge-green diff-easy", medium: "badge-amber diff-medium", hard: "badge-red diff-hard" };
  return <span className={`badge ${map[diff] || "badge-gray"}`}>{diff}</span>;
}

function QTypeBadge({ type }) {
  const map = { mcq: ["badge-blue", "MCQ"], coding: ["badge-accent", "Code"], short: ["badge-purple", "Short Ans"], image: ["badge-amber", "Image"] };
  const [cls, label] = map[type] || ["badge-gray", type];
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ─── Auth Screen ───────────────────────────────────────────────────────────────
function AuthScreen({ onLogin, users=[] }) {
  const [tab, setTab] = useState("login");
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
  setLoading(true);

  setTimeout(() => {
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === pass &&
        u.role === role
    );

    if (!user) {
      setLoading(false);
      alert("Invalid email, password, or role.");
      return;
    }

    setLoading(false);
    onLogin(user);
  }, 500);
};

  return (
    <div className="auth-screen">
      <div className="auth-bg" />
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Icon name="cpu" size={22} style={{ color: "white" }} />
          </div>
          <div className="auth-logo-text">Examify<span>.ai</span></div>
        </div>

        <div className="tabs mb-4">
          <div className={`tab ${tab === "login" ? "active" : ""}`} onClick={() => setTab("login")}>Sign in</div>
          <div className={`tab ${tab === "signup" ? "active" : ""}`} onClick={() => setTab("signup")}>Create account</div>
        </div>

        <div className="auth-title">{tab === "login" ? "Welcome back" : "Join Examify"}</div>
        <div className="auth-subtitle">{tab === "login" ? "Sign in to your account" : "Create your free account"}</div>

        <div className="role-cards">
          {[["student", "🎓", "Student", "Take quizzes & track progress"], ["teacher", "👨‍🏫", "Teacher", "Create & manage assessments"]].map(([r, icon, nm, desc]) => (
            <div key={r} className={`role-card ${role === r ? "selected" : ""}`} onClick={() => setRole(r)}>
              <div className="role-card-icon">{icon}</div>
              <div className="role-card-name">{nm}</div>
              <div className="role-card-desc">{desc}</div>
            </div>
          ))}
        </div>

        <div className="auth-divider">or continue with email</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tab === "signup" && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input className="input" type="email" placeholder="you@college.edu" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} />
          </div>
          <button className="btn btn-primary w-full" style={{ justifyContent: "center", padding: "10px", marginTop: 4 }} onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="ai-loading"><span className="ai-dot"/><span className="ai-dot"/><span className="ai-dot"/></span> : tab === "login" ? "Sign in" : "Create account"}
          </button>
        </div>

        <p className="text-xs text-faint" style={{ textAlign: "center", marginTop: 16 }}>
          Secured by JWT · Role-based access · One-device restriction
        </p>
      </div>
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ role, page, setPage }) {
  const teacherNav = [
    { id: "dashboard", icon: "home", label: "Dashboard" },
    { id: "classrooms", icon: "classroom", label: "Classrooms" },
    { id: "quizzes", icon: "book", label: "Quiz Manager" },
    { id: "questions", icon: "question", label: "Question Pool" },
    { id: "coding", icon: "code", label: "Coding Editor" },
    { id: "ai", icon: "ai", label: "AI Generator", badge: "NEW" },
    { id: "analytics", icon: "chart", label: "Analytics" },
    { id: "notifications", icon: "bell", label: "Notifications", badge: "3" },
  ];
  const studentNav = [
    { id: "dashboard", icon: "home", label: "Dashboard" },
    { id: "classrooms", icon: "classroom", label: "My Classrooms" },
    { id: "quizzes", icon: "book", label: "My Quizzes", badge: "2" },
    { id: "attempt", icon: "play", label: "Take Quiz" },
    { id: "coding", icon: "code", label: "Coding Lab" },
    { id: "analytics", icon: "chart", label: "My Progress" },
    { id: "notifications", icon: "bell", label: "Notifications", badge: "2" },
  ];
  const nav = role === "teacher" ? teacherNav : studentNav;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Icon name="cpu" size={18} style={{ color: "white" }} />
        </div>
        <div className="sidebar-logo-text">Examify<span>.ai</span></div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Navigation</div>
        <ul className="sidebar-nav">
          {nav.map(item => (
            <li key={item.id} className={`sidebar-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
              <span className="sidebar-item-icon"><Icon name={item.icon} size={15} /></span>
              {item.label}
              {item.badge && <span className="sidebar-badge">{item.badge}</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-user">
        <div className={`avatar ${role === "teacher" ? "" : ""}`} style={{ background: role === "teacher" ? "linear-gradient(135deg,#6c63ff,#a855f7)" : "linear-gradient(135deg,#22d3a0,#4da6ff)" }}>
          {role === "teacher" ? "PS" : "AM"}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{role === "teacher" ? "Prof. Sharma" : "Arjun Mehta"}</div>
          <div className="sidebar-user-role">{role === "teacher" ? "Teacher · CS Dept" : "Student · CS101"}</div>
        </div>
      </div>
    </aside>
  );
}

// ─── Teacher Dashboard ─────────────────────────────────────────────────────────
function TeacherDashboard({currentUser, quizzes}) {
  const weekData = [
    { label: "Mon", value: 45, color: "var(--accent)" },
    { label: "Tue", value: 72, color: "var(--accent)" },
    { label: "Wed", value: 38, color: "var(--accent)" },
    { label: "Thu", value: 91, color: "var(--purple)" },
    { label: "Fri", value: 67, color: "var(--accent)" },
    { label: "Sat", value: 28, color: "var(--accent)" },
    { label: "Sun", value: 15, color: "var(--accent)" },
  ];

  return (
    <div className="fade-in">
      <div className="dashboard-hero">
        <div>
          <h1>Welcome back, {currentUser?.name || "Teacher"} 👋</h1>
          <p>You have <strong>3 active quizzes</strong> and <strong>12 pending reviews</strong> today.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary"><Icon name="plus" size={14} /> New Quiz</button>
          <button className="btn btn-primary"><Icon name="ai" size={14} /> AI Generate</button>
        </div>
      </div>

      <div className="grid-4 mb-6">
        {[
          { label: "Total Students", value: "248", delta: "+12 this week", up: true },
          { label: "Active Quizzes", value: "3", delta: "2 closing soon", up: false },
          { label: "Avg Class Score", value: "74%", delta: "+5% vs last week", up: true },
          { label: "Cheating Alerts", value: "5", delta: "Needs review", up: false },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-delta ${s.up ? "up" : "down"}`}>{s.up ? "↑" : "↓"} {s.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <div className="section-head mb-4">
            <div>
              <div className="section-title" style={{ fontSize: 16 }}>Submission Activity</div>
              <div className="section-subtitle">Quiz attempts this week</div>
            </div>
          </div>
          <MiniBarChart data={weekData} height={100} />
        </div>

        <div className="card">
          <div className="section-head mb-4">
            <div className="section-title" style={{ fontSize: 16 }}>Recent Alerts</div>
          </div>
          {[
            { student: "Vikram Nair", action: "Tab switched 4 times", quiz: "OS Quiz", time: "2h ago", sev: "high" },
            { student: "Ritu Sharma", action: "Copy-paste detected", quiz: "DS Quiz", time: "3h ago", sev: "med" },
            { student: "Karan Joshi", action: "Window blur detected", quiz: "DB Quiz", time: "5h ago", sev: "low" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <div className="avatar avatar-sm" style={{ background: a.sev === "high" ? "rgba(255,92,92,0.2)" : "rgba(245,166,35,0.2)", color: a.sev === "high" ? "var(--red)" : "var(--amber)" }}>⚠</div>
              <div className="flex-1">
                <div style={{ fontSize: 13, fontWeight: 500 }}>{a.student} · <span className="text-muted">{a.quiz}</span></div>
                <div className="text-xs text-faint">{a.action}</div>
              </div>
              <span className="text-xs text-faint">{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-head">
          <div className="section-title" style={{ fontSize: 16 }}>Active Quizzes</div>
          <button className="btn btn-ghost btn-sm">View all</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Quiz</th><th>Subject</th><th>Status</th><th>Attempts</th><th>Avg Score</th><th>Window</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map(q => (
              <tr key={q.id}>
                <td><span style={{ fontWeight: 500, color: "var(--text)" }}>{q.title}</span></td>
                <td><span className="badge badge-gray">{q.subject}</span></td>
                <td><StatusBadge status={q.status} /></td>
                <td>{q.attempts}</td>
                <td>{q.avgScore > 0 ? <span style={{ color: q.avgScore > 75 ? "var(--green)" : q.avgScore > 60 ? "var(--amber)" : "var(--red)" }}>{q.avgScore}%</span> : "—"}</td>
                <td className="text-faint" style={{ fontSize: 12 }}>{q.window}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm btn-icon"><Icon name="eye" size={13} /></button>
                    <button className="btn btn-ghost btn-sm btn-icon"><Icon name="edit" size={13} /></button>
                    <button className="btn btn-ghost btn-sm btn-icon"><Icon name="chart" size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Student Dashboard ─────────────────────────────────────────────────────────
function StudentDashboard({ setPage, quizzes, currentUser }) {
  const scores = [
    { label: "DS", value: 82 }, { label: "Algo", value: 67 }, { label: "DB", value: 91 },
    { label: "OS", value: 54 }, { label: "CN", value: 78 },
  ];

  return (
    <div className="fade-in">
      <div className="dashboard-hero" style={{ background: "linear-gradient(135deg,rgba(34,211,160,0.12) 0%,rgba(77,166,255,0.08) 100%)", borderColor: "rgba(34,211,160,0.2)" }}>
        <div>
  <h1>Hey {currentUser?.name || "Student"}! 🚀</h1>
  <p>You have <strong>2 quizzes due</strong> this week. Keep up the streak!</p>
</div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 40, fontFamily: "var(--serif)", fontWeight: 600, color: "var(--green)" }}>82%</div>
          <div className="text-xs text-faint">Overall accuracy</div>
        </div>
      </div>

      <div className="grid-4 mb-6">
        {[
          { label: "Quizzes Taken", value: "24" },
          { label: "Avg Score", value: "74%" },
          { label: "Current Rank", value: "#3" },
          { label: "Coding Solved", value: "47" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <div className="section-title" style={{ fontSize: 16, marginBottom: 16 }}>Score Trends</div>
          <MiniBarChart data={scores.map((s, i) => ({ ...s, color: s.value > 80 ? "var(--green)" : s.value > 65 ? "var(--accent)" : "var(--red)" }))} />
        </div>

        <div className="card">
          <div className="section-title" style={{ fontSize: 16, marginBottom: 16 }}>Upcoming Quizzes</div>
          {quizzes.filter(q => q.status === "live").map(q => (
            <div key={q.id} className="flex items-center gap-3 mb-3 p-3 rounded" style={{ background: "var(--bg3)" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{q.title}</div>
                <div className="text-xs text-faint"><Icon name="clock" size={10} /> {q.duration}min · {q.questions} questions</div>
              </div>
              <button className="btn btn-primary btn-sm" style={{ marginLeft: "auto", whiteSpace: "nowrap" }} onClick={() => setPage("attempt")}>
                Start <Icon name="arrow_right" size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-title" style={{ fontSize: 16, marginBottom: 4 }}>Weak Topics — AI Analysis</div>
        <div className="section-subtitle mb-4">Based on your recent quiz performance</div>
        {[
          { topic: "Dynamic Programming", score: 42, suggestion: "Review memoization patterns" },
          { topic: "Graph Traversal", score: 55, suggestion: "Practice BFS/DFS problems" },
          { topic: "Process Scheduling", score: 58, suggestion: "Revise FCFS, SJF algorithms" },
        ].map((t, i) => (
          <div key={i} className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 13, fontWeight: 500 }}>{t.topic}</span>
              <span style={{ fontSize: 12, color: t.score < 50 ? "var(--red)" : "var(--amber)" }}>{t.score}%</span>
            </div>
            <div className="progress mb-2">
              <div className="progress-fill" style={{ width: `${t.score}%`, background: t.score < 50 ? "var(--red)" : "var(--amber)" }} />
            </div>
            <div className="text-xs text-faint">💡 {t.suggestion}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Quiz Manager (Teacher) ────────────────────────────────────────────────────
function QuizManager({quizzes, setQuizzes, batches, attempts, setAttempts}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [resultsQuiz, setResultsQuiz] = useState(null);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  const [questionType, setQuestionType] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
  type: "mcq",
  topic: "",
  marks: "",
  questionText: "",
  options: ["", "", "", ""],
  correctOption: 0,
  expectedAnswer: "",
  keywords: "",
  evaluationMode: "manual",
  imageData: "",
  imageName: "",
  problemTitle: "",
  problemDescription: "",
  constraints: "",
  sampleInput: "",
  sampleOutput: "",
  starterCode: "",
  testCases: "",
});
  const [settings, setSettings] = useState({ fullscreen: true, randomQ: true, randomOpts: false, copyPaste: true, tabDetect: true });
const [newQuiz, setNewQuiz] = useState({
  title: "",
  subject: "",
  batchId: "",
  batchName: "",
  duration: "",
  totalMarks: "",
  availableFrom: "",
  availableUntil: "",
  instructions: "",
});
const handleQuizInputChange = (field, value) => {
  setNewQuiz((prev) => ({
    ...prev,
    [field]: value,
  }));
};
const resetQuizForm = () => {
  setNewQuiz({
    title: "",
    subject: "",
    batchId: "",
    batchName: "",
    duration: "",
    totalMarks: "",
    availableFrom: "",
    availableUntil: "",
    instructions: "",
  });

  setEditingQuizId(null);
};

const handleCreateQuiz = () => {
  if (!newQuiz.title.trim() || !newQuiz.subject.trim()) {
    alert("Please enter quiz title and subject.");
    return;
  }

  if (editingQuizId) {
    setQuizzes((prev) =>
      prev.map((quiz) =>
        quiz.id === editingQuizId
          ? {
              ...quiz,
              title: newQuiz.title,
              subject: newQuiz.subject,
              batchId: newQuiz.batchId,
batchName: newQuiz.batchName,
              duration: Number(newQuiz.duration) || 30,
              totalMarks: Number(newQuiz.totalMarks) || 0,
              availableFrom: newQuiz.availableFrom,
              availableUntil: newQuiz.availableUntil,
              window:
                newQuiz.availableFrom && newQuiz.availableUntil
                  ? `${new Date(newQuiz.availableFrom).toLocaleDateString()} – ${new Date(
                      newQuiz.availableUntil
                    ).toLocaleDateString()}`
                  : quiz.window || "Not scheduled",
              instructions: newQuiz.instructions,
              settings,
            }
          : quiz
      )
    );
  } else {
    const quizToAdd = {
      id: Date.now(),
      title: newQuiz.title,
      subject: newQuiz.subject,
      batchId: newQuiz.batchId,
batchName: newQuiz.batchName,
      questions: 0,
      duration: Number(newQuiz.duration) || 30,
      status: "draft",
      difficulty: "medium",
      attempts: 0,
      avgScore: 0,
      availableFrom: newQuiz.availableFrom,
      availableUntil: newQuiz.availableUntil,
      window:
        newQuiz.availableFrom && newQuiz.availableUntil
          ? `${new Date(newQuiz.availableFrom).toLocaleDateString()} – ${new Date(
              newQuiz.availableUntil
            ).toLocaleDateString()}`
          : "Not scheduled",
      totalMarks: Number(newQuiz.totalMarks) || 0,
      instructions: newQuiz.instructions,
      settings,
    };

    setQuizzes((prev) => [quizToAdd, ...prev]);
  }

  resetQuizForm();
  setShowCreate(false);
};

const handleStatusChange = (quizId, newStatus) => {
  setQuizzes((prev) =>
    prev.map((quiz) =>
      quiz.id === quizId
        ? {
            ...quiz,
            status: newStatus,
          }
        : quiz
    )
  );
};

const handleEditQuiz = (quiz) => {
  setEditingQuizId(quiz.id);

  setNewQuiz({
    title: quiz.title || "",
    subject: quiz.subject || "",
    batchId: quiz.batchId || "",
  batchName: quiz.batchName || "",
    duration: quiz.duration || "",
    totalMarks: quiz.totalMarks || "",
    availableFrom: quiz.availableFrom || "",
    availableUntil: quiz.availableUntil || "",
    instructions: quiz.instructions || "",
  });

  if (quiz.settings) {
    setSettings(quiz.settings);
  }

  setShowCreate(true);
};
const handleDeleteQuiz = (quizId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this quiz?");

  if (!confirmDelete) return;

  setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId));
};
const handleDuplicateQuiz = (quizToDuplicate) => {
  const duplicatedQuiz = {
    ...quizToDuplicate,
    id: Date.now(),
    title: `${quizToDuplicate.title} Copy`,
    status: "draft",
    attempts: 0,
    avgScore: 0,
  };

  setQuizzes((prev) => [duplicatedQuiz, ...prev]);
};

const openQuestionForm = (type) => {
  setQuestionType(type);

  setNewQuestion({
  type,
  topic: "",
  marks: "",
  questionText: "",
  options: ["", "", "", ""],
  correctOption: 0,
  expectedAnswer: "",
  keywords: "",
  evaluationMode: "short" ? "nlp" : "manual",
  imageData: "",
  imageName: "",
  problemTitle: "",
  problemDescription: "",
  constraints: "",
  sampleInput: "",
  sampleOutput: "",
  starterCode:
    type === "coding"
      ? `function solve(input) {
  // Write your code here
}`
      : "",
  testCases: "",
});
};

const handleQuestionChange = (field, value) => {
  setNewQuestion((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const handleOptionChange = (index, value) => {
  setNewQuestion((prev) => {
    const updatedOptions = [...prev.options];
    updatedOptions[index] = value;

    return {
      ...prev,
      options: updatedOptions,
    };
  });
};

const handleImageUpload = (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please upload a valid image file.");
    return;
  }

  const reader = new FileReader();

  reader.onloadend = () => {
    setNewQuestion((prev) => ({
      ...prev,
      imageData: reader.result,
      imageName: file.name,
    }));
  };

  reader.readAsDataURL(file);
};

const removeQuestionImage = () => {
  setNewQuestion((prev) => ({
    ...prev,
    imageData: "",
    imageName: "",
  }));
};

const handleAddQuestionToQuiz = () => {
  if (!editingQuizId) {
    alert("Please create or edit a quiz before adding questions.");
    return;
  }

  if (!newQuestion.questionText.trim()) {
    alert("Please enter the question.");
    return;
  }

  if (newQuestion.type === "mcq") {
    const hasEmptyOption = newQuestion.options.some((opt) => !opt.trim());

    if (hasEmptyOption) {
      alert("Please fill all MCQ options.");
      return;
    }
  }
  if (newQuestion.type === "short") {
  if (!newQuestion.expectedAnswer.trim() && !newQuestion.keywords.trim()) {
    alert("Please enter an expected answer or keywords for evaluation.");
    return;
  }
}
if (newQuestion.type === "coding") {
  if (!newQuestion.problemTitle.trim()) {
    alert("Please enter the problem title.");
    return;
  }

  if (!newQuestion.problemDescription.trim()) {
    alert("Please enter the problem description.");
    return;
  }

  if (!newQuestion.sampleInput.trim() || !newQuestion.sampleOutput.trim()) {
    alert("Please enter sample input and sample output.");
    return;
  }
}

  const questionToAdd = {
    id: Date.now(),
    ...newQuestion,
    marks: Number(newQuestion.marks) || 1,
  };

  setQuizzes((prev) =>
    prev.map((quiz) =>
      quiz.id === editingQuizId
        ? {
            ...quiz,
            questionList: [...(quiz.questionList || []), questionToAdd],
            questions: (quiz.questionList || []).length + 1,
          }
        : quiz
    )
  );

  setNewQuestion({
  type: questionType || "mcq",
  topic: "",
  marks: "",
  questionText: "",
  options: ["", "", "", ""],
  correctOption: 0,
  expectedAnswer: "",
  keywords: "",
  evaluationMode: questionType === "short" ? "nlp" : "manual",
  imageData: "",
  imageName: "",
  problemTitle: "",
  problemDescription: "",
  constraints: "",
  sampleInput: "",
  sampleOutput: "",
  starterCode:
    questionType === "coding"
      ? `function solve(input) {
  // Write your code here
}`
      : "",
  testCases: "",
});

  setQuestionType(null);
};
const handleDeleteQuestionFromQuiz = (questionId) => {
  if (!editingQuizId) return;

  const confirmDelete = window.confirm("Delete this question?");

  if (!confirmDelete) return;

  setQuizzes((prev) =>
    prev.map((quiz) => {
      if (quiz.id !== editingQuizId) return quiz;

      const updatedQuestions = (quiz.questionList || []).filter(
        (question) => question.id !== questionId
      );

      return {
        ...quiz,
        questionList: updatedQuestions,
        questions: updatedQuestions.length,
      };
    })
  );
};

const getQuizQuestionsForResults = (quiz) => {
  return (quiz?.questionList || []).map((question, index) => ({
    id: question.id || index,
    text: question.questionText || question.text || "Untitled question",
    type: question.type || "mcq",
    opts: question.options || question.opts || [],
    correct: question.correctOption ?? question.correct,
    marks: Number(question.marks) || 1,
    topic: question.topic || "",
    expectedAnswer: question.expectedAnswer || "",
    keywords: question.keywords || "",
    image:
      question.image ||
      question.imageData ||
      question.imageUrl ||
      question.imagePreview ||
      question.questionImage ||
      question.uploadedImage ||
      null,
  }));
};

const handleManualMarkChange = (attemptId, questionIndex, value) => {
  const numericValue = Number(value);

  setAttempts((prev) =>
    prev.map((attempt) =>
      attempt.id === attemptId
        ? {
            ...attempt,
            manualMarks: {
              ...(attempt.manualMarks || {}),
              [questionIndex]: numericValue,
            },
          }
        : attempt
    )
  );

  setSelectedAttempt((prev) =>
    prev && prev.id === attemptId
      ? {
          ...prev,
          manualMarks: {
            ...(prev.manualMarks || {}),
            [questionIndex]: numericValue,
          },
        }
      : prev
  );
};

const handleSaveEvaluation = () => {
  if (!selectedAttempt) return;

  const manualScore = Object.values(selectedAttempt.manualMarks || {}).reduce(
    (sum, mark) => sum + (Number(mark) || 0),
    0
  );

  const finalScore = (selectedAttempt.score || 0) + manualScore;

  const updatedAttempt = {
    ...selectedAttempt,
    manualScore,
    finalScore,
    evaluated: true,
    evaluatedAt: new Date().toLocaleString(),
  };

  setAttempts((prev) =>
    prev.map((attempt) =>
      attempt.id === selectedAttempt.id ? updatedAttempt : attempt
    )
  );

  setSelectedAttempt(updatedAttempt);

  alert("Evaluation saved successfully.");
};

if (selectedAttempt && resultsQuiz) {
  const resultQuestions = getQuizQuestionsForResults(resultsQuiz);

  const manualScore = Object.values(selectedAttempt.manualMarks || {}).reduce(
    (sum, mark) => sum + (Number(mark) || 0),
    0
  );

  const finalScore = (selectedAttempt.score || 0) + manualScore;

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="section-title">Attempt Review</div>
          <div className="section-subtitle">
            {selectedAttempt.studentName} • {resultsQuiz.title}
          </div>
        </div>

         <div className="flex gap-2">
    <button className="btn btn-success" onClick={handleSaveEvaluation}>
      Save Evaluation
    </button>

        <button
          className="btn btn-secondary"
          onClick={() => setSelectedAttempt(null)}
        >
          Back to Results
        </button>
      </div>
      </div>

      <div className="card mb-4">
        <div className="grid-3">
          <div className="quiz-stat">
            <div className="quiz-stat-value">
              {selectedAttempt.score || 0}/{selectedAttempt.maxScore || 0}
            </div>
            <div className="quiz-stat-label">Auto Score</div>
          </div>

          <div className="quiz-stat">
            <div className="quiz-stat-value">{manualScore}</div>
            <div className="quiz-stat-label">Manual Score</div>
          </div>

          <div className="quiz-stat">
            <div className="quiz-stat-value">
              {finalScore}/{selectedAttempt.maxScore || 0}
            </div>
            <div className="quiz-stat-label">Final Score</div>
          </div>
        </div>
      </div>

      {resultQuestions.map((question, index) => {
        const studentAnswer = selectedAttempt.answers?.[index];
        const isMcq = question.type === "mcq";
        const isCorrect = isMcq && studentAnswer === question.correct;

        return (
          <div key={question.id} className="card mb-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm" style={{ fontWeight: 700 }}>
                  Q{index + 1}. {question.text}
                </div>
                <div className="text-xs text-faint mt-1">
                  {question.type.toUpperCase()} • {question.marks} mark(s)
                </div>
              </div>

              {isMcq && (
                <span className={`badge ${isCorrect ? "badge-green" : "badge-red"}`}>
                  {isCorrect ? "Correct" : "Wrong"}
                </span>
              )}
            </div>

            {question.image && (
              <div
                style={{
                  background: "var(--bg3)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: 12,
                  marginBottom: 16,
                }}
              >
                <img
                  src={question.image}
                  alt="Question reference"
                  style={{
                    width: "100%",
                    maxHeight: 220,
                    objectFit: "contain",
                    borderRadius: 10,
                    display: "block",
                  }}
                />
              </div>
            )}

            {isMcq ? (
              <div className="grid-2">
                <div>
                  <div className="form-label">Student Answer</div>
                  <div className="text-sm">
                    {studentAnswer !== undefined
                      ? question.opts?.[studentAnswer]
                      : "Not answered"}
                  </div>
                </div>

                <div>
                  <div className="form-label">Correct Answer</div>
                  <div className="text-sm">
                    {question.opts?.[question.correct] || "Not set"}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="form-label">Student Answer</div>
                <div
                  className="p-3 rounded mb-3"
                  style={{
                    background: "var(--bg2)",
                    border: "1px solid var(--border)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {studentAnswer || "Not answered"}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Manual Marks out of {question.marks}
                  </label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    max={question.marks}
                    value={selectedAttempt.manualMarks?.[index] ?? ""}
                    onChange={(e) =>
                      handleManualMarkChange(
                        selectedAttempt.id,
                        index,
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}



if (resultsQuiz) {
  const quizAttempts = attempts.filter(
    (attempt) => attempt.quizId === resultsQuiz.id
  );

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="section-title">Results: {resultsQuiz.title}</div>
          <div className="section-subtitle">
            Student attempts submitted for this quiz
          </div>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => setResultsQuiz(null)}
        >
          Back to Quizzes
        </button>
      </div>

      {quizAttempts.length === 0 ? (
        <div className="card">
          <div className="text-sm text-faint">
            No student attempts submitted yet.
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="section-title" style={{ fontSize: 16, marginBottom: 12 }}>
            Submitted Attempts
          </div>

          {quizAttempts.map((attempt) => (
            <div
              key={attempt.id}
              className="p-3 rounded mb-2"
              style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm" style={{ fontWeight: 600 }}>
                    {attempt.studentName}
                  </div>
                  <div className="text-xs text-faint">
                    {attempt.studentEmail}
                  </div>
                  <div className="text-xs text-faint mt-1">
                    Submitted: {attempt.submittedAt}
                  </div>
                </div>

                <div className="flex gap-2 items-center">
  <span className="badge badge-blue">
    {attempt.answeredCount}/{attempt.totalQuestions} answered
  </span>

  <span className="badge badge-green">
    Score: {attempt.score ?? 0}/{attempt.maxScore ?? 0}
  </span>

  {attempt.evaluated && (
    <span className="badge badge-green">
      Final: {attempt.finalScore}/{attempt.maxScore}
    </span>
  )}

                  {attempt.violations > 0 && (
                    <span className="badge badge-amber">
                      {attempt.violations} violation(s)
                    </span>
                  )}
                  <button
    className="btn btn-primary btn-sm"
    onClick={() => setSelectedAttempt(attempt)}
  >
    Review
  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

  return (
    <div className="fade-in">
      <div className="section-head mb-6">
        <div>
          <div className="section-title">Quiz Manager</div>
          <div className="section-subtitle">Create, manage, and monitor your assessments</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary"><Icon name="copy" size={14} /> Duplicate</button>
          <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}><Icon name="plus" size={14} /> Create Quiz</button>
        </div>
      </div>

      {showCreate && (
        <div className="card mb-6 fade-in">
          <div className="section-title" style={{ fontSize: 16, marginBottom: 20 }}>
            {editingQuizId ? "Edit Quiz" : "New Quiz"}
          </div>
          <div className="grid-2 mb-4">
            <div className="form-group">
              <label className="form-label">Quiz Title</label>
              <input
                  className="input"
                  placeholder="e.g. CNS Lab CIE Quiz"
                  value={newQuiz.title}
                  onChange={(e) => handleQuizInputChange("title", e.target.value)}
                />
            </div>
            <div className="form-group">
              <label className="form-label">Subject / Course Code</label>
              <input
                className="input"
                placeholder="e.g. CS201"
                value={newQuiz.subject}
                onChange={(e) => handleQuizInputChange("subject", e.target.value)}
               />
            </div>
            <div className="form-group">
  <label className="form-label">Assign to Batch</label>
  <select
    className="input"
    value={newQuiz.batchId}
    onChange={(e) => {
      const selectedBatch = batches.find((batch) => batch.id === e.target.value);

      setNewQuiz((prev) => ({
        ...prev,
        batchId: selectedBatch?.id || "",
        batchName: selectedBatch?.name || "",
      }));
    }}
  >
    <option value="">Select batch</option>
    {batches.map((batch) => (
      <option key={batch.id} value={batch.id}>
        {batch.name} - {batch.subject}
      </option>
    ))}
  </select>
</div>
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input
              className="input"
              type="number"
              placeholder="45"
              value={newQuiz.duration}
              onChange={(e) => handleQuizInputChange("duration", e.target.value)}
            />
            </div>
            <div className="form-group">
              <label className="form-label">Total Marks</label>
              <input
              className="input"
              type="number"
              placeholder="100"
              value={newQuiz.totalMarks}
              onChange={(e) => handleQuizInputChange("totalMarks", e.target.value)}
            />
            </div>
            <div className="form-group">
              <label className="form-label">Available From</label>
              <input
              className="input"
              type="datetime-local"
              value={newQuiz.availableFrom}
              onChange={(e) => handleQuizInputChange("availableFrom", e.target.value)}
            />
            </div>
            <div className="form-group">
              <label className="form-label">Available Until</label>
              <input
              className="input"
              type="datetime-local"
              value={newQuiz.availableUntil}
              onChange={(e) => handleQuizInputChange("availableUntil", e.target.value)}
            />
            </div>
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Instructions</label>
            <textarea
            className="input"
            rows={3}
            placeholder="Add quiz instructions for students..."
            style={{ resize: "vertical" }}
            value={newQuiz.instructions}
            onChange={(e) => handleQuizInputChange("instructions", e.target.value)}
          />
          </div>

          <div className="section-title" style={{ fontSize: 14, marginBottom: 12 }}>Anti-Cheating & Settings</div>
          <div className="grid-2 mb-4">
            {[
              ["fullscreen", "Fullscreen Enforcement"], ["randomQ", "Randomize Question Order"],
              ["randomOpts", "Randomize Option Order"], ["copyPaste", "Disable Copy/Paste"],
              ["tabDetect", "Tab Switch Detection"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded" style={{ background: "var(--bg3)" }}>
                <span className="text-sm">{label}</span>
                <Toggle checked={settings[key]} onChange={v => setSettings(s => ({ ...s, [key]: v }))} />
              </div>
            ))}
          </div>

          <div className="section-title" style={{ fontSize: 14, marginBottom: 12 }}>Question Sections</div>
          <div className="grid-4 mb-4">
            {[
                ["MCQ", "badge-blue", "mcq"],
                ["Short Answer", "badge-purple", "short"],
                ["Coding", "badge-accent", "coding"],
                
              ].map(([label, cls, type]) => (
                <div
                  key={type}
                  className="p-3 rounded text-center"
                  style={{
                    background: questionType === type ? "var(--primary-soft)" : "var(--bg3)",
                    border:
                      questionType === type
                        ? "1px solid var(--primary)"
                        : "1px dashed var(--border2)",
                    cursor: "pointer",
                  }}
                  onClick={() => openQuestionForm(type)}
                >
                  <span className={`badge ${cls}`}>{label}</span>
                  <div className="text-xs text-faint mt-2">+ Add questions</div>
                </div>
              ))}
          </div>
          {questionType && (
  <div className="card mb-4" style={{ background: "var(--bg2)" }}>
    <div className="section-title" style={{ fontSize: 14, marginBottom: 12 }}>
      Add {questionType === "mcq" ? "MCQ" : questionType} Question
    </div>

    <div className="grid-2 mb-3">
      <div className="form-group">
        <label className="form-label">Topic</label>
        <input
          className="input"
          placeholder="e.g. Arrays, OS Scheduling, Network Security"
          value={newQuestion.topic}
          onChange={(e) => handleQuestionChange("topic", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Marks</label>
        <input
          className="input"
          type="number"
          placeholder="1"
          value={newQuestion.marks}
          onChange={(e) => handleQuestionChange("marks", e.target.value)}
        />
      </div>
    </div>

    <div className="form-group mb-3">
      <label className="form-label">Question</label>
      <textarea
        className="input"
        rows={3}
        placeholder="Enter your question..."
        style={{ resize: "vertical" }}
        value={newQuestion.questionText}
        onChange={(e) => handleQuestionChange("questionText", e.target.value)}
      />
    </div>
    <div className="form-group mb-3">
  <label className="form-label">Optional Image Attachment</label>
  <input
    className="input"
    type="file"
    accept="image/*"
    onChange={handleImageUpload}
  />

  {newQuestion.imageName && (
    <div className="text-xs text-faint mt-1">
      Selected: {newQuestion.imageName}
    </div>
  )}

  {newQuestion.imageData && (
    <div className="mt-3">
      <img
        src={newQuestion.imageData}
        alt="Question preview"
        style={{
          maxWidth: "100%",
          maxHeight: 220,
          borderRadius: 12,
          border: "1px solid var(--border)",
          objectFit: "contain",
        }}
      />

      <div className="mt-2">
        <button
          className="btn btn-danger btn-sm"
          onClick={removeQuestionImage}
        >
          Remove Image
        </button>
      </div>
    </div>
  )}
</div>

    {questionType === "mcq" && (
      <div className="mb-3">
        <label className="form-label">Options</label>

        {newQuestion.options.map((option, index) => (
          <div key={index} className="flex gap-2 mb-2 items-center">
            <input
              type="radio"
              name="correctOption"
              checked={newQuestion.correctOption === index}
              onChange={() => handleQuestionChange("correctOption", index)}
            />

            <input
              className="input"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
            />
          </div>
        ))}

        <div className="text-xs text-faint">
          Select the radio button beside the correct answer.
        </div>
      </div>
    )}
    {questionType === "short" && (
  <div className="mb-3">
    <div className="form-group mb-3">
      <label className="form-label">Expected Answer</label>
      <textarea
        className="input"
        rows={3}
        placeholder="Write the ideal answer or key points..."
        style={{ resize: "vertical" }}
        value={newQuestion.expectedAnswer}
        onChange={(e) => handleQuestionChange("expectedAnswer", e.target.value)}
      />
    </div>

    <div className="form-group mb-3">
      <label className="form-label">Keywords / Concepts</label>
      <input
        className="input"
        placeholder="e.g. process, scheduling, ready queue"
        value={newQuestion.keywords}
        onChange={(e) => handleQuestionChange("keywords", e.target.value)}
      />
      <div className="text-xs text-faint mt-1">
        These can later be used for NLP-based evaluation.
      </div>
    </div>

    <div className="form-group">
      <label className="form-label">Evaluation Mode</label>
      <select
        className="input"
        value={newQuestion.evaluationMode}
        onChange={(e) => handleQuestionChange("evaluationMode", e.target.value)}
      >
        <option value="manual">Manual Review</option>
        <option value="nlp">NLP Assisted</option>
      </select>
    </div>
  </div>
)}
{questionType === "coding" && (
  <div className="mb-3">
    <div className="form-group mb-3">
      <label className="form-label">Problem Title</label>
      <input
        className="input"
        placeholder="e.g. Two Sum"
        value={newQuestion.problemTitle}
        onChange={(e) => handleQuestionChange("problemTitle", e.target.value)}
      />
    </div>

    <div className="form-group mb-3">
      <label className="form-label">Problem Description</label>
      <textarea
        className="input"
        rows={4}
        placeholder="Describe the problem clearly..."
        style={{ resize: "vertical" }}
        value={newQuestion.problemDescription}
        onChange={(e) => handleQuestionChange("problemDescription", e.target.value)}
      />
    </div>

    <div className="form-group mb-3">
      <label className="form-label">Constraints</label>
      <textarea
        className="input"
        rows={2}
        placeholder="e.g. 1 <= n <= 10^5"
        style={{ resize: "vertical" }}
        value={newQuestion.constraints}
        onChange={(e) => handleQuestionChange("constraints", e.target.value)}
      />
    </div>

    <div className="grid-2 mb-3">
      <div className="form-group">
        <label className="form-label">Sample Input</label>
        <textarea
          className="input"
          rows={3}
          placeholder="Example input"
          style={{ resize: "vertical" }}
          value={newQuestion.sampleInput}
          onChange={(e) => handleQuestionChange("sampleInput", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Sample Output</label>
        <textarea
          className="input"
          rows={3}
          placeholder="Expected output"
          style={{ resize: "vertical" }}
          value={newQuestion.sampleOutput}
          onChange={(e) => handleQuestionChange("sampleOutput", e.target.value)}
        />
      </div>
    </div>

    <div className="form-group mb-3">
      <label className="form-label">Starter Code</label>
      <textarea
        className="input"
        rows={5}
        style={{ resize: "vertical", fontFamily: "monospace" }}
        value={newQuestion.starterCode}
        onChange={(e) => handleQuestionChange("starterCode", e.target.value)}
      />
    </div>

    <div className="form-group">
      <label className="form-label">Hidden/Public Test Cases</label>
      <textarea
        className="input"
        rows={4}
        placeholder={`Example:
Input: 2 7 11 15 | 9
Output: 0 1

Input: 3 2 4 | 6
Output: 1 2`}
        style={{ resize: "vertical", fontFamily: "monospace" }}
        value={newQuestion.testCases}
        onChange={(e) => handleQuestionChange("testCases", e.target.value)}
      />
      <div className="text-xs text-faint mt-1">
        For now, test cases are stored as text. Later they can be parsed and sent to Judge0/backend.
      </div>
    </div>
  </div>
)}
    {questionType !== "mcq" && questionType !== "short" && questionType !== "coding" && (
  <div className="text-sm text-faint mb-3">
    This question type UI will be added next.
  </div>
)}

    <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
      <button
        className="btn btn-secondary"
        onClick={() => setQuestionType(null)}
      >
        Cancel Question
      </button>

      <button className="btn btn-primary" onClick={handleAddQuestionToQuiz}>
        <Icon name="plus" size={14} /> Add Question
      </button>
    </div>
  </div>
)}
{editingQuizId && (
  <div className="mb-4">
    <div className="section-title" style={{ fontSize: 14, marginBottom: 12 }}>
      Added Questions
    </div>

    {quizzes.find((q) => q.id === editingQuizId)?.questionList?.length > 0 ? (
      quizzes
        .find((q) => q.id === editingQuizId)
        .questionList.map((question, index) => (
          <div
            key={question.id}
            className="p-3 rounded mb-2"
            style={{ background: "var(--bg3)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between">
              <div>
  {question.imageData && (
    <img
      src={question.imageData}
      alt="Question thumbnail"
      style={{
        width: 80,
        height: 55,
        objectFit: "cover",
        borderRadius: 8,
        border: "1px solid var(--border)",
        marginBottom: 8,
      }}
    />
  )}

  <div className="text-sm font-semibold">
    Q{index + 1}. {question.type === "coding" ? question.problemTitle : question.questionText}
  </div>

  <div className="text-xs text-faint mt-1">
    {question.type.toUpperCase()} • {question.topic || "No topic"} • {question.marks} mark(s)
    {question.type === "coding" && (
  <div className="text-xs text-faint mt-1">
    Sample: {question.sampleInput || "No sample input"} → {question.sampleOutput || "No sample output"}
  </div>
)}
    {question.type === "short" && question.evaluationMode
      ? ` • ${question.evaluationMode === "nlp" ? "NLP Assisted" : "Manual Review"}`
      : ""}
    {question.imageData ? " • Image attached" : ""}
  </div>
</div>

              <div className="flex items-center gap-2">
  <span className="badge badge-blue">
    {question.type}
  </span>

  <button
    className="btn btn-danger btn-sm btn-icon"
    onClick={() => handleDeleteQuestionFromQuiz(question.id)}
  >
    <Icon name="trash" size={12} />
  </button>
</div>
            </div>
          </div>
        ))
    ) : (
      <div className="text-sm text-faint">
        No questions added yet.
      </div>
    )}
  </div>
)}
          <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
            <button
            className="btn btn-secondary"
            onClick={() => {
              resetQuizForm();
              setShowCreate(false);
            }}
          >
            Cancel
          </button>

  <button className="btn btn-primary" onClick={handleCreateQuiz}>
  <Icon name="check" size={14} /> {editingQuizId ? "Update Quiz" : "Create Quiz"}
</button>
</div>
        </div>
      )}

      <div className="grid-2">
        {quizzes.map(q => (
          <div key={q.id} className="quiz-card">
            <div className="quiz-card-header">
              <div className="flex items-center justify-between mb-2">
                <StatusBadge status={q.status} />
                <DiffBadge diff={q.difficulty} />
              </div>
              <div className="quiz-card-title">{q.title}</div>
<div className="quiz-card-meta">
  <span className="badge badge-gray">{q.subject}</span>

  {q.batchName && (
    <span className="badge badge-blue">{q.batchName}</span>
  )}

  <span className="badge badge-gray">
    <Icon name="clock" size={10} /> {q.duration}min
  </span>

  <span className="badge badge-gray">{q.questions} Qs</span>
</div>
            </div>
            <div className="quiz-card-body">
              <div className="text-xs text-faint mb-3">📅 {q.window}</div>
                           <div className="quiz-card-stats">
                <div className="quiz-stat">
                  <div className="quiz-stat-value">{q.attempts}</div>
                  <div className="quiz-stat-label">Attempts</div>
                </div>

                <div className="quiz-stat">
                  <div
                    className="quiz-stat-value"
                    style={{
                      color:
                        q.avgScore > 75
                          ? "var(--green)"
                          : q.avgScore > 60
                          ? "var(--amber)"
                          : q.avgScore > 0
                          ? "var(--red)"
                          : "var(--text3)",
                    }}
                  >
                    {q.avgScore > 0 ? q.avgScore + "%" : "—"}
                  </div>
                  <div className="quiz-stat-label">Avg Score</div>
                </div>

                <div className="quiz-stat">
                  <div className="quiz-stat-value">3</div>
                  <div className="quiz-stat-label">Sections</div>
                </div>
              </div>

              <div className="form-group mt-3">
                <label className="form-label">Quiz Status</label>
                <select
                  className="input"
                  value={q.status}
                  onChange={(e) => handleStatusChange(q.id, e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="live">Live</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              
              <div className="flex gap-2 mt-3">
                <button
                  className="btn btn-ghost btn-sm flex-1"
                  onClick={() => handleEditQuiz(q)}
                >
                  <Icon name="edit" size={12} /> Edit
                </button>
                <button
  className="btn btn-ghost btn-sm flex-1"
  onClick={() => setResultsQuiz(q)}
>
  <Icon name="chart" size={12} /> Results
</button>
                <button
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => handleDuplicateQuiz(q)}
              >
                <Icon name="copy" size={12} />
              </button>
                <button
                  className="btn btn-danger btn-sm btn-icon"
                  onClick={() => handleDeleteQuiz(q.id)}
                >
                  <Icon name="trash" size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Question Pool ─────────────────────────────────────────────────────────────
function QuestionPool() {
  const [selected, setSelected] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [filterDiff, setFilterDiff] = useState("all");
  const [showAuto, setShowAuto] = useState(false);

  const filtered = SAMPLE_QUESTIONS.filter(q =>
    (filterType === "all" || q.type === filterType) &&
    (filterDiff === "all" || q.difficulty === filterDiff)
  );

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <div className="fade-in">
      <div className="section-head mb-4">
        <div>
          <div className="section-title">Question Pool</div>
          <div className="section-subtitle">Centralized repository of {SAMPLE_QUESTIONS.length} questions</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => setShowAuto(!showAuto)}><Icon name="zap" size={14} /> Auto-Generate</button>
          <button className="btn btn-primary"><Icon name="plus" size={14} /> Add Question</button>
        </div>
      </div>

      {showAuto && (
        <div className="card mb-4 fade-in" style={{ border: "1px solid rgba(108,99,255,0.3)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Icon name="ai" size={16} style={{ color: "var(--accent2)" }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--accent2)" }}>Auto-generate balanced quiz</span>
          </div>
          <div className="grid-3 mb-3">
            {[["Easy", "var(--green)"], ["Medium", "var(--amber)"], ["Hard", "var(--red)"]].map(([diff, color]) => (
              <div key={diff} className="form-group">
                <label className="form-label"># {diff} questions</label>
                <input className="input" type="number" placeholder={diff === "Easy" ? "5" : diff === "Medium" ? "3" : "2"} style={{ borderColor: color + "33" }} />
              </div>
            ))}
          </div>
          <div className="form-group mb-3">
            <label className="form-label">Topic filter</label>
            <input className="input" placeholder="e.g. Algorithms, Data Structures" />
          </div>
          <button className="btn btn-primary btn-sm"><Icon name="zap" size={12} /> Generate Quiz</button>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <div className="tabs">
          {["all", "mcq", "short", "coding", "image"].map(t => (
            <div key={t} className={`tab ${filterType === t ? "active" : ""}`} onClick={() => setFilterType(t)}>{t === "all" ? "All" : t.toUpperCase()}</div>
          ))}
        </div>
        <select className="select" value={filterDiff} onChange={e => setFilterDiff(e.target.value)} style={{ marginLeft: "auto" }}>
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        {selected.length > 0 && (
          <button className="btn btn-primary btn-sm"><Icon name="plus" size={12} /> Add {selected.length} to Quiz</button>
        )}
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 32 }}></th>
              <th>Title</th><th>Type</th><th>Topic</th><th>Difficulty</th><th>Marks</th><th>Tags</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(q => (
              <tr key={q.id} style={{ background: selected.includes(q.id) ? "rgba(108,99,255,0.05)" : "" }}>
                <td>
                  <input type="checkbox" checked={selected.includes(q.id)} onChange={() => toggle(q.id)}
                    style={{ accentColor: "var(--accent)", cursor: "pointer" }} />
                </td>
                <td><span style={{ fontWeight: 500, color: "var(--text)" }}>{q.title}</span></td>
                <td><QTypeBadge type={q.type} /></td>
                <td><span className="text-sm">{q.topic} / {q.subtopic}</span></td>
                <td><DiffBadge diff={q.difficulty} /></td>
                <td><span style={{ fontWeight: 600, color: "var(--text)" }}>{q.marks}</span></td>
                <td>
                  <div className="flex gap-1">
                    {q.tags.map(t => <span key={t} className="badge badge-gray text-xs">{t}</span>)}
                  </div>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn btn-ghost btn-sm btn-icon"><Icon name="eye" size={13} /></button>
                    <button className="btn btn-ghost btn-sm btn-icon"><Icon name="edit" size={13} /></button>
                    <button className="btn btn-danger btn-sm btn-icon"><Icon name="trash" size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Coding Interface ──────────────────────────────────────────────────────────
function CodingInterface({ quizzes, quizId }) {
 
  // ── derive the active quiz & its coding questions ──────────────────────────
  const activeQuiz = useMemo(
    () => quizzes?.find((q) => q.id === quizId) || quizzes?.[0] || null,
    [quizzes, quizId]
  );
 
  const codingQuestions = useMemo(
    () => (activeQuiz?.questionList || []).filter((q) => q.type === "coding"),
    [activeQuiz]
  );
 
  // ── state ──────────────────────────────────────────────────────────────────
  const [questionIndex, setQuestionIndex] = useState(0);
  const [lang, setLang]                   = useState("python");
  const [codeMap, setCodeMap]             = useState({});   // { `${qId}_${lang}`: code }
  const [output, setOutput]               = useState("");
  const [running, setRunning]             = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [activeTab, setActiveTab]         = useState("output");
  const [customInput, setCustomInput]     = useState("");
  const [verdict, setVerdict]             = useState("");
  const [testResults, setTestResults]     = useState([]);
  const [timeLeft, setTimeLeft] = useState(() => {
  const duration = Number(quiz?.duration) || 45;
  return duration * 60;
});
  const [warnings, setWarnings]           = useState(0);
  const [leftWidth, setLeftWidth]         = useState(45);
  const isDragging                        = useRef(false);
 
  // ── current question ───────────────────────────────────────────────────────
  const question = codingQuestions[questionIndex] || null;
 
  // ── code for (question, language) pair ────────────────────────────────────
  const codeKey = question ? `${question.id}_${lang}` : null;
 
  const code = codeKey
    ? (codeMap[codeKey] ??
        (lang === "python"
          ? question?.starterCode ||
            `def solve():\n    # write your solution here\n    pass\n\nsolve()`
          : lang === "cpp"
          ? `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // write your solution here\n    return 0;\n}`
          : lang === "java"
          ? `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        // write your solution here\n    }\n}`
          : `#include <stdio.h>\n\nint main() {\n    // write your solution here\n    return 0;\n}`))
    : "";
 
  const setCode = (val) => {
    if (!codeKey) return;
    setCodeMap((prev) => ({ ...prev, [codeKey]: val }));
  };
 
  // ── timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setTimeLeft((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
 
  // ── tab-switch detection ───────────────────────────────────────────────────
  useEffect(() => {
    const handle = () => { if (document.hidden) setWarnings((p) => p + 1); };
    document.addEventListener("visibilitychange", handle);
    return () => document.removeEventListener("visibilitychange", handle);
  }, []);
 
  // ── resize drag ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current) return;
      const pct = (e.clientX / window.innerWidth) * 100;
      if (pct >= 25 && pct <= 75) setLeftWidth(pct);
    };
    const onUp = () => { isDragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);
 
  // ── helpers ────────────────────────────────────────────────────────────────
  const formatTime = (s) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(
      Math.floor((s % 3600) / 60)
    ).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
 
  // Judge0 language IDs
  const LANG_ID = { python: 71, cpp: 54, java: 62, c: 50 };
 
  // parse "Input: ...\nOutput: ..." blocks from testCases textarea
  const parseTestCases = (raw = "") => {
    const blocks = raw.trim().split(/\n\s*\n/).filter(Boolean);
    return blocks.map((block, i) => {
      const inMatch  = block.match(/Input:\s*(.+?)(?=Output:|$)/si);
      const outMatch = block.match(/Output:\s*(.+)/si);
      return {
        id: i + 1,
        input:  inMatch  ? inMatch[1].trim()  : "",
        expected: outMatch ? outMatch[1].trim() : "",
      };
    });
  };
 
  // ── run (sample test cases only) ──────────────────────────────────────────
  const runCode = async () => {
    if (!code.trim()) { setOutput("No code to run."); return; }
    setRunning(true);
    setVerdict("");
    setOutput("Running...");
    
    try {
      const res = await fetch("http://localhost:5000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language_id: LANG_ID[lang] || 71,
          stdin: customInput ||
            (question?.sampleInput ? question.sampleInput : ""),
        }),
      });
     const data = await res.json();
const rawOutput = data.output || data.error || "No output";
setOutput(rawOutput);

if (activeTab === "custom" && question?.sampleOutput) {
  // normalize: trim each line, remove empty lines, rejoin
  const normalize = (s) =>
    s.split("\n")
     .map((l) => l.trim())
     .filter((l) => l.length > 0)
     .join("\n");

  const got      = normalize(rawOutput);
  const expected = normalize(question.sampleOutput);

  console.log("GOT:", JSON.stringify(got));
  console.log("EXPECTED:", JSON.stringify(expected));

  setVerdict(got === expected ? "Accepted" : "Wrong Answer");
} else {
  setVerdict(data.verdict || "");

}
    } catch {
      setOutput("Error: could not reach execution server.");
    }
    setRunning(false);
  };
 
  // ── submit (hidden test cases) ─────────────────────────────────────────────
  const submitCode = async () => {
    if (!code.trim()) { setOutput("No code to submit."); return; }
    setSubmitting(true);
    setVerdict("Judging…");
    setTestResults([]);
    setActiveTab("tests");
    try {
      const hiddenCases = parseTestCases(question?.testCases || "");
      // fall back to sample if no hidden cases defined
      const cases = hiddenCases.length
        ? hiddenCases
        : [{ id: 1, input: question?.sampleInput || "", expected: question?.sampleOutput || "" }];
 
      const res = await fetch("http://localhost:5000/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language_id: LANG_ID[lang] || 71,
          test_cases: cases,
          question_id: question?.id,
        }),
      });
      const data = await res.json();
      setVerdict(data.verdict || "");
      setTestResults(data.test_results || []);
    } catch {
      setVerdict("Error");
      setOutput("Error: could not reach execution server.");
    }
    setSubmitting(false);
  };
 
  // ── empty state ────────────────────────────────────────────────────────────
  if (!question) {
    return (
      <div className="fade-in" style={{ padding: 40, textAlign: "center" }}>
        <div className="section-title">No Coding Questions</div>
        <div className="section-subtitle" style={{ marginTop: 8 }}>
          {activeQuiz
            ? "This quiz has no coding questions yet. Ask your instructor to add some."
            : "No quiz found. Please contact your instructor."}
        </div>
      </div>
    );
  }
 
  // ── main layout ────────────────────────────────────────────────────────────
  return (
    <div className="fade-in" style={{ height: "calc(100vh - 100px)", display: "flex", flexDirection: "column" }}>
 
      {/* ── Top bar: quiz title + question tabs ── */}
      <div style={{
        padding: "8px 16px",
        background: "var(--bg2)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
      }}>
        <span style={{ fontWeight: 700, fontSize: 13 }}>
          {activeQuiz?.title || "Quiz"}
        </span>
 
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {codingQuestions.map((q, i) => (
            <button
              key={q.id}
              className={`btn btn-sm ${i === questionIndex ? "btn-primary" : "btn-ghost"}`}
              onClick={() => {
                setQuestionIndex(i);
                setVerdict("");
                setOutput("");
                setTestResults([]);
              }}
            >
              Q{i + 1}
            </button>
          ))}
        </div>
 
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span className="badge badge-purple">⏱ {formatTime(timeLeft)}</span>
          {warnings > 0 && (
            <span className="badge badge-red">⚠ {warnings} warning{warnings > 1 ? "s" : ""}</span>
          )}
        </div>
      </div>
 
      {/* ── Split pane ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
 
        {/* LEFT – problem statement */}
        <div style={{
          width: `${leftWidth}%`,
          borderRight: "1px solid var(--border)",
          overflowY: "auto",
          background: "var(--bg2)",
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span className="badge badge-blue">{question.topic || "General"}</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{question.problemTitle}</span>
            <span className="badge badge-gray" style={{ marginLeft: "auto" }}>
              {question.marks} mark{question.marks !== 1 ? "s" : ""}
            </span>
          </div>
 
          <div style={{ padding: "16px 18px", flex: 1 }}>
            {/* Description */}
            <div style={{ fontSize: 13, lineHeight: 1.8, color: "var(--text2)", marginBottom: 16 }}>
              {question.problemDescription}
            </div>
 
            {/* Optional image */}
            {question.imageData && (
              <img
                src={question.imageData}
                alt="Problem illustration"
                style={{
                  maxWidth: "100%", borderRadius: 10,
                  border: "1px solid var(--border)", marginBottom: 16,
                }}
              />
            )}
 
            {/* Constraints */}
            {question.constraints && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: "var(--text3)" }}>
                  CONSTRAINTS
                </div>
                <pre style={{
                  fontSize: 12, background: "var(--bg3)", borderRadius: 8,
                  padding: "8px 12px", fontFamily: "var(--mono)", whiteSpace: "pre-wrap",
                }}>
                  {question.constraints}
                </pre>
              </div>
            )}
 
            {/* Sample I/O */}
            {(question.sampleInput || question.sampleOutput) && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: "var(--text3)" }}>
                  EXAMPLE
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 3 }}>Input</div>
                    <pre style={{
                      fontSize: 12, background: "var(--bg3)", borderRadius: 8,
                      padding: "8px 12px", fontFamily: "var(--mono)", whiteSpace: "pre-wrap",
                    }}>
                      {question.sampleInput}
                    </pre>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 3 }}>Output</div>
                    <pre style={{
                      fontSize: 12, background: "var(--bg3)", borderRadius: 8,
                      padding: "8px 12px", fontFamily: "var(--mono)", whiteSpace: "pre-wrap",
                    }}>
                      {question.sampleOutput}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
 
        {/* RESIZE HANDLE */}
        <div
          onMouseDown={() => { isDragging.current = true; }}
          style={{ width: 5, cursor: "col-resize", background: "var(--border)", flexShrink: 0 }}
        />
 
        {/* RIGHT – editor + output */}
        <div style={{
          width: `${100 - leftWidth}%`,
          display: "flex",
          flexDirection: "column",
          background: "var(--bg)",
        }}>
 
          {/* Editor toolbar */}
          <div style={{
            padding: "8px 12px",
            background: "var(--bg2)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <select
              className="input"
              style={{ width: 130, padding: "4px 8px", fontSize: 12 }}
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="python">Python 3</option>
              <option value="cpp">C++ 17</option>
              <option value="java">Java 17</option>
              <option value="c">C99</option>
            </select>
 
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={runCode}
                disabled={running || submitting}
              >
                {running ? "Running…" : "▶ Run"}
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={submitCode}
                disabled={running || submitting}
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
 
          {/* Monaco editor — uses the global Editor from @monaco-editor/react */}
          <div style={{ flex: 1, overflow: "hidden" }}>
            {typeof Editor !== "undefined" ? (
              <Editor
                height="100%"
                language={lang === "cpp" ? "cpp" : lang}
                value={code}
                onChange={(val) => setCode(val || "")}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                }}
              />
            ) : (
              /* Fallback plain textarea if Monaco isn't loaded */
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                style={{
                  width: "100%", height: "100%", resize: "none",
                  background: "#1e1e1e", color: "#d4d4d4",
                  fontFamily: "var(--mono, monospace)", fontSize: 14,
                  border: "none", outline: "none", padding: 16,
                  boxSizing: "border-box",
                }}
              />
            )}
          </div>
 
          {/* Output / Test panel */}
          <div style={{
            height: 260,
            borderTop: "1px solid var(--border)",
            background: "var(--bg2)",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Tabs */}
            <div style={{
              display: "flex",
              gap: 4,
              padding: "8px 12px",
              borderBottom: "1px solid var(--border)",
              alignItems: "center",
            }}>
              {["output", "tests", "custom"].map((tab) => (
                <button
                  key={tab}
                  className={`btn btn-sm ${activeTab === tab ? "btn-primary" : "btn-ghost"}`}
                  onClick={() => setActiveTab(tab)}
                  style={{ textTransform: "capitalize" }}
                >
                  {tab}
                </button>
              ))}
 
              {verdict && (
                <span
                  className={`badge ${
                    verdict === "Accepted" ? "badge-green" :
                    verdict === "Judging…" ? "badge-purple" :
                    "badge-red"
                  }`}
                  style={{ marginLeft: "auto" }}
                >
                  {verdict}
                </span>
              )}
            </div>
 
            {/* Panel body */}
            <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
 
              {activeTab === "output" && (
                <pre style={{ fontFamily: "var(--mono, monospace)", fontSize: 12, whiteSpace: "pre-wrap" }}>
                  {output || "Click Run to execute your code against the sample input…"}
                </pre>
              )}
 
              {activeTab === "tests" && (
                testResults.length === 0
                  ? <div className="text-sm text-faint">Submit your code to see test results.</div>
                  : testResults.map((r) => (
                    <div key={r.id} style={{
                      background: r.pass ? "rgba(0,200,100,0.08)" : "rgba(255,70,70,0.08)",
                      border: `1px solid ${r.pass ? "rgba(0,200,100,0.3)" : "rgba(255,70,70,0.3)"}`,
                      padding: "10px 12px",
                      borderRadius: 8,
                      marginBottom: 8,
                      fontSize: 12,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>
                          {r.pass ? "✓" : "✗"} Test Case {r.id}
                        </span>
                        <span className="text-faint">{r.time || ""}</span>
                      </div>
                      {!r.pass && (
                        <div style={{ fontFamily: "var(--mono, monospace)", color: "var(--text3)" }}>
                          <div>Expected: <span style={{ color: "var(--green)" }}>{r.expected}</span></div>
                          <div>Got:      <span style={{ color: "var(--red)"   }}>{r.got}</span></div>
                        </div>
                      )}
                      {r.error && (
                        <div style={{ color: "var(--red)", fontFamily: "var(--mono, monospace)", marginTop: 4 }}>
                          {r.error}
                        </div>
                      )}
                    </div>
                  ))
              )}
 
              {activeTab === "custom" && (
                <div>
                  <div className="text-xs text-faint" style={{ marginBottom: 6 }}>
                    Custom stdin (used when you click Run):
                  </div>
                  <textarea
                    className="input"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    rows={5}
                    style={{ width: "100%", fontFamily: "var(--mono, monospace)", fontSize: 12, resize: "vertical" }}
                    placeholder="Enter custom input here…"
                  />
                </div>
              )}
 
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ─── Quiz Attempt Interface ────────────────────────────────────────────────────
function QuizAttempt({quiz, setPage, currentUser, setAttempts}) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState([]);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [showCheat, setShowCheat] = useState(false);
  const [violations, setViolations] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const questions = (quiz?.questionList || []).map((question, index) => ({
  id: question.id || index,
  text: question.questionText || question.text || "Untitled question",
  type: question.type || "mcq",
  opts: question.options || question.opts || [],
  correct: question.correctOption ?? question.correct,
  marks: Number(question.marks) || 1,
  topic: question.topic || "",
  expectedAnswer: question.expectedAnswer || "",
  keywords: question.keywords || "",
  image:
    question.image ||
    question.imageData ||
    question.imageUrl ||
    question.imagePreview ||
    question.questionImage ||
    question.uploadedImage ||
    null,
}));
if (!quiz) {
  return (
    <div className="fade-in">
      <div className="card">
        <div className="section-title mb-2">No quiz selected</div>
        <div className="text-sm text-faint mb-4">
          Please go back to My Quizzes and start a quiz.
        </div>
        <button className="btn btn-primary" onClick={() => setPage("quizzes")}>
          Back to My Quizzes
        </button>
      </div>
    </div>
  );
}

if (questions.length === 0) {
  return (
    <div className="fade-in">
      <div className="card">
        <div className="section-title mb-2">{quiz.title}</div>
        <div className="text-sm text-faint mb-4">
          This quiz does not have any questions yet.
        </div>
        <button className="btn btn-primary" onClick={() => setPage("quizzes")}>
          Back to My Quizzes
        </button>
      </div>
    </div>
  );
}

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  const getStatus = (i) => {
    if (i === current) return "q-current";
    if (flagged.includes(i)) return "q-flagged";
    if (answers[i] !== undefined) return "q-attempted";
    return "q-unattempted";
  };

  const q = questions[current];
  console.log("Current question:", q);

  const calculateScore = () => {
  let score = 0;
  let maxScore = 0;

  questions.forEach((question, index) => {
    const marks = Number(question.marks) || 1;
    maxScore += marks;

    if (question.type === "mcq") {
      const studentAnswer = answers[index];

      if (studentAnswer === question.correct) {
        score += marks;
      }
    }
  });

  return { score, maxScore };
};

  const handleSubmitQuiz = () => {
  const confirmSubmit = confirm(
    "Submit quiz? You cannot change answers after submitting."
  );

  if (!confirmSubmit) return;

   const answeredCount = Object.keys(answers).length;
   const { score, maxScore } = calculateScore();

  const attemptToSave = {
    id: Date.now(),
    quizId: quiz.id,
    quizTitle: quiz.title,
    studentId: currentUser?.id,
    studentName: currentUser?.name || "Unknown Student",
    studentEmail: currentUser?.email || "",
    batchId: currentUser?.batchId || "",
    answers,
    answeredCount,
    totalQuestions: questions.length,
    score,
  maxScore,
    violations,
    submittedAt: new Date().toLocaleString(),
  };

  setAttempts((prev) => {
  const alreadyAttempted = prev.some(
    (attempt) =>
      attempt.quizId === quiz?.id && attempt.studentId === currentUser?.id
  );

  if (alreadyAttempted) {
    alert("You have already submitted this quiz.");
    return prev;
  }

  return [attemptToSave, ...prev];
});

  setSubmitted(true);
};

  const triggerCheatWarning = () => {
    const newV = violations + 1;
    setViolations(newV);
    if (newV >= 3) { setShowCheat(true); setSubmitted(true); return; }
    alert(`⚠ Warning ${newV}/3: Tab switching detected. Quiz will auto-submit after 3 violations.`);
  };
  if (submitted) {
  const answeredCount = Object.keys(answers).length;
  const { score, maxScore } = calculateScore();

  return (
    <div className="fade-in">
      <div className="card" style={{ maxWidth: 680, margin: "0 auto" }}>
        <div className="section-title mb-2">Quiz Submitted</div>

        <div className="text-sm text-faint mb-4">
          Your responses have been recorded for this attempt.
        </div>

        <div className="grid-4 mb-4">
          <div className="quiz-stat">
            <div className="quiz-stat-value">{quiz.title}</div>
            <div className="quiz-stat-label">Quiz</div>
          </div>

          <div className="quiz-stat">
            <div className="quiz-stat-value">
              {answeredCount}/{questions.length}
            </div>
            <div className="quiz-stat-label">Answered</div>
          </div>

          <div className="quiz-stat">
  <div className="quiz-stat-value">
    {score}/{maxScore}
  </div>
  <div className="quiz-stat-label">Auto Score</div>
</div>

          <div className="quiz-stat">
            <div className="quiz-stat-value">{violations}</div>
            <div className="quiz-stat-label">Violations</div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setPage("quizzes")}>
          Back to My Quizzes
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="fade-in">
      {showCheat && (
        <div className="cheat-overlay">
          <div className="cheat-box">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚨</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600, color: "var(--red)", marginBottom: 8 }}>Quiz Auto-Submitted</div>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>Multiple violations detected (tab switching). Your quiz has been automatically submitted and flagged for review.</p>
            <button className="btn btn-danger" onClick={() => setShowCheat(false)}>View Results</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16 }}>
        {/* Question Panel */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24, minHeight: 400 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <span className="badge badge-gray">Question {current + 1}/{questions.length}</span>
              <QTypeBadge type={q.type} />
              <span className="badge badge-amber">{q.marks} marks</span>
            </div>
            <button
              className={`btn btn-sm ${flagged.includes(current) ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFlagged(f => f.includes(current) ? f.filter(x => x !== current) : [...f, current])}
            >
              <Icon name="flag" size={12} /> {flagged.includes(current) ? "Flagged" : "Flag"}
            </button>
          </div>

          <div style={{ fontFamily: "var(--serif)", fontSize: 18, color: "var(--text)", marginBottom: 24, lineHeight: 1.6 }}>
            {q.text}
          </div>
          {q.image && (
  <div
    style={{
      background: "var(--bg3)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      padding: 12,
      marginBottom: 16,
    }}
  >
    <img
      src={q.image}
      alt="Question reference"
      style={{
        width: "100%",
        maxHeight: 260,
        objectFit: "contain",
        borderRadius: 10,
        display: "block",
      }}
    />
  </div>
)}

          {q.type === "mcq" && q.opts.map((opt, i) => (
            <div key={i} className={`option-card ${answers[current] === i ? "selected" : ""}`} onClick={() => setAnswers(a => ({ ...a, [current]: i }))}>
              <div className="option-letter">{["A", "B", "C", "D"][i]}</div>
              <span style={{ fontSize: 14, color: "var(--text)" }}>{opt}</span>
            </div>
          ))}

          {q.type === "short" && (
            <textarea className="input" style={{ minHeight: 160, resize: "vertical", fontFamily: "var(--sans)", lineHeight: 1.7 }}
              placeholder="Write your answer here..." value={answers[current] || ""}
              onChange={e => setAnswers(a => ({ ...a, [current]: e.target.value }))} />
          )}

          {q.type === "coding" && (
            <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
              <div style={{ padding: "8px 12px", background: "var(--bg2)", borderBottom: "1px solid var(--border)", display: "flex", gap: 8 }}>
                <select className="select" style={{ fontSize: 11, padding: "3px 6px" }}>
                  <option>Python 3</option><option>C++</option><option>Java</option>
                </select>
              </div>
              <textarea
                style={{ width: "100%", height: 200, background: "transparent", border: "none", color: "var(--text)", fontFamily: "var(--mono)", fontSize: 13, padding: 16, resize: "none", lineHeight: 1.7, outline: "none" }}
                placeholder="// Write your solution here..."
                value={answers[current] || ""}
                onChange={e => setAnswers(a => ({ ...a, [current]: e.target.value }))}
              />
            </div>
          )}

          {q.type === "image" && (
  <div>
    {q.image ? (
      <div
        style={{
          background: "var(--bg3)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 12,
          marginBottom: 16,
        }}
      >
        <img
          src={q.image}
          alt="Question reference"
          style={{
            width: "100%",
            maxHeight: 260,
            objectFit: "contain",
            borderRadius: 10,
            display: "block",
          }}
        />
      </div>
    ) : (
      <div
        style={{
          background: "var(--bg3)",
          border: "1px dashed var(--border2)",
          borderRadius: "var(--radius)",
          height: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
          color: "var(--text3)",
          fontSize: 13,
        }}
      >
        No image attached for this question.
      </div>
    )}

    <div className="form-group">
      <label className="form-label">Your answer</label>
      <input
        className="input"
        placeholder="Write your answer here..."
        value={answers[current] || ""}
        onChange={(e) =>
          setAnswers((a) => ({ ...a, [current]: e.target.value }))
        }
      />
    </div>
  </div>
)}

          <div className="flex items-center justify-between mt-6">
            <button className="btn btn-secondary" disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>← Previous</button>
            <button className="btn btn-ghost btn-sm" onClick={triggerCheatWarning} style={{ fontSize: 11, color: "var(--text3)" }}>Simulate Tab Switch</button>
            {current < questions.length - 1
              ? <button className="btn btn-primary" onClick={() => setCurrent(c => c + 1)}>Next →</button>
              : (
  <button className="btn btn-success" onClick={handleSubmitQuiz}>
    Submit Quiz
  </button>
)}
          </div>
        </div>

        {/* Nav Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "var(--bg2)", border: `1px solid ${timeLeft < 300 ? "rgba(255,92,92,0.4)" : "var(--border)"}`, borderRadius: "var(--radius-lg)", padding: 16, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 36, fontWeight: 500, color: timeLeft < 300 ? "var(--red)" : "var(--text)" }}>{mins}:{secs}</div>
            <div className="text-xs text-faint mt-1">Time remaining</div>
            {violations > 0 && <div style={{ marginTop: 8, fontSize: 11, color: "var(--amber)" }}>⚠ {violations} violation{violations > 1 ? "s" : ""} detected</div>}
          </div>

          <div className="card card-sm">
            <div className="form-label mb-3">Question Navigator</div>
            <div className="q-grid">
              {questions.map((_, i) => (
                <div key={i} className={`q-bubble ${getStatus(i)}`} onClick={() => setCurrent(i)}>{i + 1}</div>
              ))}
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
              {[["q-attempted", "Attempted"], ["q-unattempted", "Unattempted"], ["q-flagged", "Flagged"], ["q-current", "Current"]].map(([cls, label]) => (
                <div key={cls} className="flex items-center gap-2">
                  <div className={`q-bubble ${cls}`} style={{ width: 16, height: 16, fontSize: 9, aspectRatio: "unset" }} />
                  <span className="text-xs text-faint">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-sm">
            <div className="form-label mb-2">Progress</div>
            <div className="progress mb-2">
              <div className="progress-fill" style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%`, background: "var(--green)" }} />
            </div>
            <div className="text-xs text-faint">{Object.keys(answers).length}/{questions.length} answered</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AI Generator ──────────────────────────────────────────────────────────────
function AIGenerator() {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("mcq");
  const [count, setCount] = useState(5);
  const [diff, setDiff] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState([]);

  const generate = async () => {
    setLoading(true);
    setGenerated([]);

    const body = JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `Generate ${count} ${diff} ${type} questions about: "${prompt}". 
Return ONLY a JSON array with objects having: {question, options (for mcq, array of 4), correctAnswer (index for mcq, string for short), explanation}.
No markdown, no preamble, pure JSON array.`
      }]
    });

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "[]";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setGenerated(Array.isArray(parsed) ? parsed : []);
    } catch {
      setGenerated([{ question: "Error generating questions. API key may be required.", options: [], explanation: "" }]);
    }
    setLoading(false);
  };

  return (
    <div className="fade-in">
      <div className="section-head mb-6">
        <div>
          <div className="section-title">AI Question Generator</div>
          <div className="section-subtitle">Generate questions using Claude AI</div>
        </div>
        <span className="badge badge-accent">Powered by Claude</span>
      </div>

      <div className="grid-2 mb-6">
        <div className="ai-panel">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="ai" size={18} style={{ color: "var(--accent2)" }} />
            <span style={{ fontWeight: 600, color: "var(--accent2)" }}>Generate Questions</span>
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Topic / Prompt</label>
            <textarea className="input" rows={3} placeholder="e.g. Binary trees, dynamic programming, sorting algorithms..."
              value={prompt} onChange={e => setPrompt(e.target.value)} style={{ resize: "vertical" }} />
          </div>

          <div className="grid-3 mb-4">
            <div className="form-group">
              <label className="form-label">Question Type</label>
              <select className="select w-full" value={type} onChange={e => setType(e.target.value)}>
                <option value="mcq">MCQ</option>
                <option value="short">Short Answer</option>
                <option value="coding">Coding</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select className="select w-full" value={diff} onChange={e => setDiff(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Count</label>
              <input className="input" type="number" min={1} max={10} value={count} onChange={e => setCount(+e.target.value)} />
            </div>
          </div>

          <button className="btn btn-primary w-full" style={{ justifyContent: "center", padding: 10 }} onClick={generate} disabled={loading || !prompt}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="ai-loading"><span className="ai-dot"/><span className="ai-dot"/><span className="ai-dot"/></span>
                Generating with Claude…
              </span>
            ) : <><Icon name="zap" size={14} /> Generate Questions</>}
          </button>

          <div className="divider" />

          <div className="form-group mb-3">
            <label className="form-label">Or upload sample questions (PDF/DOCX)</label>
            <div style={{ border: "1px dashed var(--border2)", borderRadius: "var(--radius)", padding: 20, textAlign: "center", cursor: "pointer", color: "var(--text3)" }}>
              <Icon name="upload" size={24} style={{ margin: "0 auto 8px", display: "block" }} />
              <div style={{ fontSize: 13 }}>Drop file or click to upload</div>
              <div className="text-xs text-faint">PDF, DOCX, TXT supported</div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--text)" }}>
            Generated Questions {generated.length > 0 && <span className="badge badge-green ml-2">{generated.length}</span>}
          </div>

          {loading && (
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              <div className="ai-loading" style={{ justifyContent: "center", marginBottom: 12 }}>
                <span className="ai-dot"/><span className="ai-dot"/><span className="ai-dot"/>
              </div>
              <div className="text-muted text-sm">Claude is generating your questions…</div>
            </div>
          )}

          {generated.length === 0 && !loading && (
            <div className="card" style={{ textAlign: "center", padding: 40, color: "var(--text3)" }}>
              <Icon name="ai" size={40} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
              <div>Enter a topic and click Generate</div>
            </div>
          )}

          {generated.map((q, i) => (
            <div key={i} className="card mb-3 fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="badge badge-gray">Q{i + 1}</span>
                <div className="flex gap-2">
                  <QTypeBadge type={type} />
                  <DiffBadge diff={diff} />
                </div>
              </div>
              <div style={{ fontWeight: 500, color: "var(--text)", marginBottom: 10, lineHeight: 1.5 }}>{q.question}</div>
              {q.options && q.options.map((opt, j) => (
                <div key={j} className={`option-card ${j === q.correctAnswer ? "selected" : ""}`} style={{ cursor: "default", marginBottom: 6 }}>
                  <div className="option-letter">{["A","B","C","D"][j]}</div>
                  <span style={{ fontSize: 13 }}>{opt}</span>
                  {j === q.correctAnswer && <span className="badge badge-green" style={{ marginLeft: "auto" }}>✓ Correct</span>}
                </div>
              ))}
              {q.explanation && (
                <div style={{ background: "var(--bg3)", borderRadius: "var(--radius)", padding: 10, marginTop: 8, fontSize: 12, color: "var(--text2)" }}>
                  💡 {q.explanation}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button className="btn btn-success btn-sm"><Icon name="plus" size={12} /> Add to Pool</button>
                <button className="btn btn-ghost btn-sm"><Icon name="edit" size={12} /> Edit</button>
                <button className="btn btn-danger btn-sm"><Icon name="trash" size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Analytics ─────────────────────────────────────────────────────────────────
function Analytics({ role }) {
  const subjectData = [
    { label: "DS", value: 74, color: "var(--accent)" },
    { label: "Algo", value: 58, color: "var(--purple)" },
    { label: "DB", value: 89, color: "var(--green)" },
    { label: "OS", value: 62, color: "var(--amber)" },
    { label: "CN", value: 71, color: "var(--blue)" },
  ];

  return (
    <div className="fade-in">
      <div className="section-head mb-6">
        <div>
          <div className="section-title">{role === "teacher" ? "Class Analytics" : "My Progress"}</div>
          <div className="section-subtitle">Performance insights and trends</div>
        </div>
      </div>

      <div className="grid-4 mb-6">
        {(role === "teacher" ? [
  { label: "Avg Class Score", value: "74%", sub: "Across all quizzes" },
  { label: "Completion Rate", value: "91%", sub: "Students submitted" },
  { label: "Top Performer", value: "Arjun M.", sub: "91% average" },
  { label: "Cheating Reports", value: "5", sub: "This month" },
] : [
  { label: "Overall Score", value: "74%", sub: "+5% this month" },
  { label: "Quizzes Done", value: "24", sub: "6 this week" },
  { label: "Global Rank", value: "#3", sub: "Out of 248" },
  { label: "Streak", value: "7 days", sub: "Keep it up! 🔥" },
]).map((s, i) => (
  <div key={i} className="stat-card">
    <div className="stat-label">{s.label}</div>
    <div className="stat-value">{s.value}</div>
    <div className="text-xs text-faint mt-1">{s.sub}</div>
  </div>
))}
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <div className="section-title" style={{ fontSize: 15, marginBottom: 16 }}>Score by Subject</div>
          <MiniBarChart data={subjectData} height={120} />
        </div>

        <div className="card">
          <div className="section-title" style={{ fontSize: 15, marginBottom: 16 }}>
            {role === "teacher" ? "Student Rankings" : "Recent Quiz Results"}
          </div>
          {role === "teacher" ? SAMPLE_STUDENTS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 mb-3">
              <span style={{ width: 20, fontSize: 12, fontWeight: 600, color: i < 3 ? "var(--amber)" : "var(--text3)", textAlign: "right" }}>#{s.rank}</span>
              <div className="avatar avatar-sm">{s.name.split(" ").map(n => n[0]).join("")}</div>
              <div className="flex-1">
                <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                <div className="progress" style={{ height: 3, marginTop: 4 }}>
                  <div className="progress-fill" style={{ width: `${s.score}%`, background: s.score > 80 ? "var(--green)" : s.score > 65 ? "var(--accent)" : "var(--amber)" }} />
                </div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: s.score > 80 ? "var(--green)" : "var(--text)" }}>{s.score}%</span>
              <StatusBadge status={s.status} />
            </div>
          )) : [
            { quiz: "OS Quiz", score: 54, date: "May 10", diff: "hard" },
            { quiz: "DB Quiz", score: 89, date: "May 8", diff: "easy" },
            { quiz: "DS Quiz", score: 78, date: "May 5", diff: "medium" },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-3 mb-3 p-3 rounded bg3">
              <div style={{ fontWeight: 500, fontSize: 13, flex: 1 }}>{r.quiz}</div>
              <DiffBadge diff={r.diff} />
              <span style={{ fontWeight: 600, color: r.score > 80 ? "var(--green)" : r.score > 65 ? "var(--accent)" : "var(--red)" }}>{r.score}%</span>
              <span className="text-xs text-faint">{r.date}</span>
            </div>
          ))}
        </div>
      </div>

      {role === "teacher" && (
        <div className="card">
          <div className="section-title" style={{ fontSize: 15, marginBottom: 4 }}>Most Missed Questions</div>
          <div className="section-subtitle mb-4">Questions with highest error rates</div>
          {[
            { q: "Explain time complexity of merge sort", miss: 68, topic: "Algorithms" },
            { q: "Implement a balanced BST insertion", miss: 72, topic: "DS" },
            { q: "Describe Banker's algorithm", miss: 81, topic: "OS" },
          ].map((m, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>{m.q}</div>
                <div className="text-xs text-faint">{m.topic}</div>
              </div>
              <div className="progress" style={{ width: 100, background: "rgba(255,92,92,0.1)" }}>
                <div className="progress-fill" style={{ width: `${m.miss}%`, background: "var(--red)" }} />
              </div>
              <span style={{ fontSize: 12, color: "var(--red)", fontWeight: 600, minWidth: 36 }}>{m.miss}% missed</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Classrooms ────────────────────────────────────────────────────────────────
function Classrooms({ role, currentUser, batches, setBatches, users, setUsers, quizzes }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newBatch, setNewBatch] = useState({
    name: "",
    department: "",
    semester: "",
    academicYear: "",
    subject: "",
  });
  const [showStudentForm, setShowStudentForm] = useState(false);
const [newStudent, setNewStudent] = useState({
  name: "",
  email: "",
  password: "student123",
  batchId: "",
});

  const studentUsers = users.filter((user) => user.role === "student");
  const visibleBatches =
  role === "teacher"
    ? batches
    : batches.filter((batch) => batch.id === currentUser?.batchId);

  const handleBatchInputChange = (field, value) => {
    setNewBatch((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateBatch = () => {
    if (!newBatch.name.trim() || !newBatch.department.trim()) {
      alert("Please enter batch name and department.");
      return;
    }

    const batchToAdd = {
      id: `batch-${Date.now()}`,
      name: newBatch.name,
      department: newBatch.department,
      semester: newBatch.semester || "Not specified",
      academicYear: newBatch.academicYear || "Not specified",
      subject: newBatch.subject || "Not assigned",
      students: [],
    };

    setBatches((prev) => [batchToAdd, ...prev]);

    setNewBatch({
      name: "",
      department: "",
      semester: "",
      academicYear: "",
      subject: "",
    });

    setShowCreate(false);
  };

const handleStudentInputChange = (field, value) => {
  setNewStudent((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const handleAddStudent = () => {
  
  if (!newStudent.name.trim() || !newStudent.email.trim()) {
    alert("Please enter student name and email.");
    return;
  }

  const emailExists = users.some(
    (user) => user.email.toLowerCase() === newStudent.email.trim().toLowerCase()
  );

  if (emailExists) {
    alert("A user with this email already exists.");
    return;
  }

  const studentToAdd = {
    id: `stu-${Date.now()}`,
    name: newStudent.name,
    email: newStudent.email,
    password: newStudent.password || "student123",
    role: "student",
    batchId: newStudent.batchId || "",
  };

  setUsers((prev) => [...prev, studentToAdd]);

  setNewStudent({
    name: "",
    email: "",
    password: "student123",
    batchId: "",
  });

  setShowStudentForm(false);
};

const handleAssignStudentToBatch = (studentId, batchId) => {
  setUsers((prev) =>
    prev.map((user) =>
      user.id === studentId
        ? {
            ...user,
            batchId,
          }
        : user
    )
  );
};

const handleRemoveStudentFromBatch = (studentId) => {
  setUsers((prev) =>
    prev.map((user) =>
      user.id === studentId
        ? {
            ...user,
            batchId: "",
          }
        : user
    )
  );
};

const handleDeleteStudent = (studentId) => {
  if (!confirm("Delete this student account?")) return;

  setUsers((prev) => prev.filter((user) => user.id !== studentId));
};

  const handleDeleteBatch = (batchId) => {
    const hasQuizzes = quizzes.some((quiz) => quiz.batchId === batchId);

    if (hasQuizzes) {
      alert("This batch has quizzes assigned. Remove/reassign those quizzes first.");
      return;
    }

    if (!confirm("Delete this batch?")) return;

    setBatches((prev) => prev.filter((batch) => batch.id !== batchId));
  };

  const getBatchStudents = (batchId) =>
    studentUsers.filter((student) => student.batchId === batchId);

  const getBatchQuizCount = (batchId) =>
    quizzes.filter((quiz) => quiz.batchId === batchId).length;

  return (
    <div className="fade-in">
      <div className="section-head mb-6">
        <div>
          <div className="section-title">Batch Management</div>
          <div className="section-subtitle">
            Create and manage college batches/classes for quiz assignment
          </div>
        </div>

        {role === "teacher" && (
  <div className="flex gap-2">
    <button
      className="btn btn-secondary"
      onClick={() => setShowStudentForm(!showStudentForm)}
    >
      <Icon name="user" size={14} /> Add Student
    </button>

    <button
      className="btn btn-primary"
      onClick={() => setShowCreate(!showCreate)}
    >
      <Icon name="plus" size={14} /> Create Batch
    </button>
  </div>
)}
      </div>

      {showCreate && role === "teacher" && (
        <div className="card mb-6">
          <div className="section-title" style={{ fontSize: 16, marginBottom: 16 }}>
            Create New Batch
          </div>

          <div className="grid-2 mb-3">
            <div className="form-group">
              <label className="form-label">Batch Name</label>
              <input
                className="input"
                placeholder="e.g. ISE A"
                value={newBatch.name}
                onChange={(e) => handleBatchInputChange("name", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                className="input"
                placeholder="e.g. Information Science and Engineering"
                value={newBatch.department}
                onChange={(e) =>
                  handleBatchInputChange("department", e.target.value)
                }
              />
            </div>
          </div>

          <div className="grid-2 mb-3">
            <div className="form-group">
              <label className="form-label">Semester</label>
              <input
                className="input"
                placeholder="e.g. 4th Semester"
                value={newBatch.semester}
                onChange={(e) => handleBatchInputChange("semester", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <input
                className="input"
                placeholder="e.g. 2024-2025"
                value={newBatch.academicYear}
                onChange={(e) =>
                  handleBatchInputChange("academicYear", e.target.value)
                }
              />
            </div>
          </div>

          <div className="form-group mb-4">
            <label className="form-label">Subject</label>
            <input
              className="input"
              placeholder="e.g. Data Structures and Algorithms"
              value={newBatch.subject}
              onChange={(e) => handleBatchInputChange("subject", e.target.value)}
            />
          </div>

          <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </button>

            <button className="btn btn-primary" onClick={handleCreateBatch}>
              <Icon name="check" size={14} /> Save Batch
            </button>
          </div>
        </div>
      )}
      {showStudentForm && role === "teacher" && (
  <div className="card mb-6">
    <div className="section-title" style={{ fontSize: 16, marginBottom: 16 }}>
      Add Student
    </div>

    <div className="grid-2 mb-3">
      <div className="form-group">
        <label className="form-label">Student Name</label>
        <input
          className="input"
          placeholder="e.g. Riya Sharma"
          value={newStudent.name}
          onChange={(e) => handleStudentInputChange("name", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          className="input"
          placeholder="e.g. riya.is23a@rvce.edu.in"
          value={newStudent.email}
          onChange={(e) => handleStudentInputChange("email", e.target.value)}
        />
      </div>
    </div>

    <div className="grid-2 mb-4">
      <div className="form-group">
        <label className="form-label">Default Password</label>
        <input
          className="input"
          value={newStudent.password}
          onChange={(e) => handleStudentInputChange("password", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Assign Batch</label>
        <select
          className="input"
          value={newStudent.batchId}
          onChange={(e) => handleStudentInputChange("batchId", e.target.value)}
        >
          <option value="">No batch yet</option>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.name} - {batch.subject}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
      <button
        className="btn btn-secondary"
        onClick={() => setShowStudentForm(false)}
      >
        Cancel
      </button>

      <button className="btn btn-primary" onClick={handleAddStudent}>
        <Icon name="check" size={14} /> Save Student
      </button>
    </div>
  </div>
)}

      <div className="grid-3">
        {visibleBatches.map((batch) => {
          const batchStudents = getBatchStudents(batch.id);
          const quizCount = getBatchQuizCount(batch.id);

          return (
            <div key={batch.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="quiz-card-title">{batch.name}</div>
                  <div className="text-xs text-faint">{batch.semester}</div>
                </div>

                <span className="badge badge-blue">
                  {batchStudents.length} students
                </span>
              </div>

              <div className="text-sm mb-2">
                <strong>Department:</strong> {batch.department}
              </div>

              <div className="text-sm mb-2">
                <strong>Subject:</strong> {batch.subject}
              </div>

              <div className="text-sm mb-2">
                <strong>Academic Year:</strong> {batch.academicYear}
              </div>

              <div className="text-sm mb-4">
                <strong>Assigned Quizzes:</strong> {quizCount}
              </div>

              <div className="mb-4">
                <div className="text-xs text-faint mb-2">Students</div>

                {batchStudents.length > 0 ? (
  batchStudents.map((student) => (
    <div
      key={student.id}
      className="text-sm mb-2"
      style={{
        padding: "8px",
        borderRadius: 8,
        background: "var(--bg2)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <div style={{ fontWeight: 600 }}>{student.name}</div>
          <div className="text-xs text-faint">{student.email}</div>
        </div>

        {role === "teacher" && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => handleRemoveStudentFromBatch(student.id)}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  ))
) : (
  <div className="text-sm text-faint">No students assigned</div>
)}
              </div>

              {role === "teacher" && (
                <div className="flex gap-2">
                  <button
                    className="btn btn-danger btn-sm flex-1"
                    onClick={() => handleDeleteBatch(batch.id)}
                  >
                    <Icon name="trash" size={12} /> Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {role === "teacher" && (
        <div className="card mt-6">
          <div className="section-title" style={{ fontSize: 16, marginBottom: 12 }}>
            All Students
          </div>

          <div className="section-subtitle mb-4">
            Assign students to batches or delete demo student accounts
          </div>

          {studentUsers.length > 0 ? (
            studentUsers.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between mb-2"
                style={{
                  padding: "10px",
                  borderRadius: 10,
                  background: "var(--bg2)",
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <div className="text-sm" style={{ fontWeight: 600 }}>
                    {student.name}
                  </div>
                  <div className="text-xs text-faint">{student.email}</div>
                </div>

                <div className="flex gap-2 items-center">
                  <select
                    className="input"
                    style={{ minWidth: 220 }}
                    value={student.batchId || ""}
                    onChange={(e) =>
                      handleAssignStudentToBatch(student.id, e.target.value)
                    }
                  >
                    <option value="">No batch</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name} - {batch.subject}
                      </option>
                    ))}
                  </select>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteStudent(student.id)}
                  >
                    <Icon name="trash" size={12} /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-faint">No students available.</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Notifications ─────────────────────────────────────────────────────────────
function Notifications() {
  return (
    <div className="fade-in">
      <div className="section-head mb-6">
        <div className="section-title">Notifications</div>
        <button className="btn btn-ghost btn-sm">Mark all read</button>
      </div>
      <div style={{ maxWidth: 600 }}>
        {NOTIFS.map(n => (
          <div key={n.id} className={`notif ${!n.read ? "notif-unread" : ""}`}>
            <div className="notif-icon" style={{ background: "var(--bg4)", fontSize: 16 }}>{n.icon}</div>
            <div className="notif-body">
              <div className="notif-title">{n.title}</div>
              <div className="notif-time">{n.time}</div>
            </div>
            {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0, marginTop: 4 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed] = useState(() => getFromStorage("authed", false));
  const [role, setRole] = useState(() => getFromStorage("role", "student"));
  const [currentUser, setCurrentUser] = useState(() =>
    getFromStorage("currentUser", null)
  );
  const [page, setPage] = useState("dashboard");
  const [selectedQuiz, setSelectedQuiz] = useState(null);

const [quizzes, setQuizzes] = useState(() =>
  getFromStorage("quizzes", SAMPLE_QUIZZES)
);
const [attempts, setAttempts] = useState(() =>
  getFromStorage("attempts", [])
);

const [batches, setBatches] = useState(() =>
  getFromStorage("batches", SAMPLE_BATCHES)
);

useEffect(() => {
  saveToStorage("quizzes", quizzes);
}, [quizzes]);
useEffect(() => {
  saveToStorage("attempts", attempts);
}, [attempts]);

useEffect(() => {
  saveToStorage("batches", batches);
}, [batches]);

const [users, setUsers] = useState(() =>
  getFromStorage("users", SAMPLE_USERS)
);
useEffect(() => {
  saveToStorage("users", users);
}, [users]);

  const handleLogin = (user) => {
  setCurrentUser(user);
  setRole(user.role);
  setAuthed(true);

  saveToStorage("currentUser", user);
  saveToStorage("role", user.role);
  saveToStorage("authed", true);

  setPage("dashboard");
};

  if (!authed) {
  return <AuthScreen onLogin={handleLogin} users={users} />;
}

  const pageTitles = {
    dashboard: "Dashboard", classrooms: "Classrooms", quizzes: "Quiz Manager",
    questions: "Question Pool", coding: "Coding Interface", ai: "AI Generator",
    analytics: "Analytics", notifications: "Notifications", attempt: "Quiz Attempt",
  };

  const renderPage = () => {
  switch (page) {
    case "dashboard":
  return role === "teacher"
    ? (
        <TeacherDashboard
          currentUser={currentUser}
          quizzes={quizzes}
          students={SAMPLE_STUDENTS}
        />
      )
    : (
        <StudentDashboard
          setPage={setPage}
          currentUser={currentUser}
          quizzes={quizzes}
        />
      );
    case "classrooms":
  return (
    <Classrooms
      role={role}
      currentUser={currentUser}
      batches={batches}
      setBatches={setBatches}
      users={users}
      setUsers={setUsers}
      quizzes={quizzes}
    />
  );

    case "quizzes":
  return role === "teacher" ? (
    <QuizManager
      quizzes={quizzes}
      setQuizzes={setQuizzes}
      batches={batches}
      attempts={attempts}
      setAttempts={setAttempts}
    />
  ) : (
    <div className="fade-in">
      <div className="section-title mb-4">My Quizzes</div>

      {quizzes.filter(
        (q) => q.status === "live" && q.batchId === currentUser?.batchId
      ).length === 0 ? (
        <div className="card">
          <div className="text-sm text-faint">
            No live quizzes assigned to your batch yet.
          </div>
        </div>
      ) : (
        quizzes
          .filter(
            (q) => q.status === "live" && q.batchId === currentUser?.batchId
          )
          .map((q) => {
            const existingAttempt = attempts.find(
              (attempt) =>
                attempt.quizId === q.id && attempt.studentId === currentUser?.id
            );
            return (
            <div key={q.id} className="quiz-card mb-3">
              <div className="quiz-card-header">
                <div className="quiz-card-title">{q.title}</div>

                <div className="quiz-card-meta">
                  <StatusBadge status={q.status} />

                  {q.batchName && (
                    <span className="badge badge-blue">{q.batchName}</span>
                  )}

                  <span className="badge badge-gray">{q.duration}min</span>
                </div>
              </div>

              <div className="quiz-card-body">
                {existingAttempt ? (
                  <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm" style={{ fontWeight: 600 }}>
                          Attempt submitted
                        </div>
                        <div className="text-xs text-faint">
                          Submitted: {existingAttempt.submittedAt}
                        </div>
                      </div>
                  <span className="badge badge-blue">
                        {existingAttempt.evaluated
                          ? `Final: ${existingAttempt.finalScore}/${existingAttempt.maxScore}`
                          : `Auto: ${existingAttempt.score ?? 0}/${
                              existingAttempt.maxScore ?? 0
                            }`}
                      </span>
                    </div>
                ) : (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
  setSelectedQuiz(q);
  setPage("attempt");
}}
                >
                  Start Quiz →
                </button>
                )}
              </div>
            </div>
          );
      })
    )}
    </div>
  );

case "questions":
  return <QuestionPool />;

   case "coding":
  return <CodingInterface quizzes={quizzes} />;

    case "ai":
      return <AIGenerator />;

    case "analytics":
      return <Analytics role={role} />;

    case "notifications":
      return <Notifications />;

    case "attempt":
  return (<QuizAttempt quiz={selectedQuiz} setPage={setPage} currentUser={currentUser} setAttempts={setAttempts} />);

    default:
      return null;
  }
};

  return (
    <>
      
      <div className="app">
        <Sidebar role={role} page={page} setPage={setPage} />
        <div className="main">
          <div className="topbar">
            <div className="topbar-breadcrumb">
              <span>Examify</span> / {pageTitles[page]}
            </div>
            <div className="topbar-actions">
              <span className="badge" style={{ background: role === "teacher" ? "rgba(108,99,255,0.15)" : "rgba(34,211,160,0.12)", color: role === "teacher" ? "var(--accent2)" : "var(--green)" }}>
                {role === "teacher" ? "👨‍🏫 Teacher" : "🎓 Student"}
              </span>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setPage("notifications")}>
                <Icon name="bell" size={15} />
              </button>
              <button
  className="btn btn-ghost btn-sm"
  onClick={() => {
    setAuthed(false);
    setCurrentUser(null);
  }}
>
  <Icon name="logout" size={14} /> Sign out
</button>
            </div>
          </div>
          <div className="content">
            {renderPage()}
          </div>
        </div>
      </div>
    </>
  );
}