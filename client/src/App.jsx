import { useState, useEffect, useRef, useCallback } from "react";
import {
  SAMPLE_QUIZZES,
  SAMPLE_STUDENTS,
  NOTIFS,
  SAMPLE_QUESTIONS,
  CODE_TEMPLATE,
} from "./data/sampleData";
import {
  getFromStorage,
  saveToStorage,
  removeFromStorage,
} from "./utils/storage";




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
function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(role); }, 1000);
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
function TeacherDashboard({quizzes}) {
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
          <h1>Good morning, Prof. Sharma 👋</h1>
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
function StudentDashboard({ setPage, quizzes }) {
  const scores = [
    { label: "DS", value: 82 }, { label: "Algo", value: 67 }, { label: "DB", value: 91 },
    { label: "OS", value: 54 }, { label: "CN", value: 78 },
  ];

  return (
    <div className="fade-in">
      <div className="dashboard-hero" style={{ background: "linear-gradient(135deg,rgba(34,211,160,0.12) 0%,rgba(77,166,255,0.08) 100%)", borderColor: "rgba(34,211,160,0.2)" }}>
        <div>
          <h1>Hey Arjun! 🚀</h1>
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
function QuizManager({quizzes, setQuizzes}) {
  const [showCreate, setShowCreate] = useState(false);
  const [settings, setSettings] = useState({ fullscreen: true, randomQ: true, randomOpts: false, copyPaste: true, tabDetect: true });
const [newQuiz, setNewQuiz] = useState({
  title: "",
  subject: "",
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

const handleCreateQuiz = () => {
  if (!newQuiz.title.trim() || !newQuiz.subject.trim()) {
    alert("Please enter quiz title and subject.");
    return;
  }

  const quizToAdd = {
    id: Date.now(),
    title: newQuiz.title,
    subject: newQuiz.subject,
    questions: 0,
    duration: Number(newQuiz.duration) || 30,
    status: "draft",
    difficulty: "medium",
    attempts: 0,
    avgScore: 0,
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

  setNewQuiz({
    title: "",
    subject: "",
    duration: "",
    totalMarks: "",
    availableFrom: "",
    availableUntil: "",
    instructions: "",
  });

  setShowCreate(false);
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
          <div className="section-title" style={{ fontSize: 16, marginBottom: 20 }}>New Quiz</div>
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
            {[["MCQ", "badge-blue", "mcq"], ["Short Answer", "badge-purple", "short"], ["Coding", "badge-accent", "coding"], ["Image-based", "badge-amber", "image"]].map(([label, cls, type]) => (
              <div key={type} className="p-3 rounded text-center" style={{ background: "var(--bg3)", border: "1px dashed var(--border2)", cursor: "pointer" }}>
                <span className={`badge ${cls}`}>{label}</span>
                <div className="text-xs text-faint mt-2">+ Add questions</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
  <button
    className="btn btn-secondary"
    onClick={() => setShowCreate(false)}
  >
    Cancel
  </button>

  <button className="btn btn-primary" onClick={handleCreateQuiz}>
    <Icon name="check" size={14} /> Create Quiz
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
                <span className="badge badge-gray"><Icon name="clock" size={10} /> {q.duration}min</span>
                <span className="badge badge-gray">{q.questions} Qs</span>
              </div>
            </div>
            <div className="quiz-card-body">
              <div className="text-xs text-faint mb-3">📅 {q.window}</div>
              <div className="quiz-card-stats">
                <div className="quiz-stat"><div className="quiz-stat-value">{q.attempts}</div><div className="quiz-stat-label">Attempts</div></div>
                <div className="quiz-stat"><div className="quiz-stat-value" style={{ color: q.avgScore > 75 ? "var(--green)" : q.avgScore > 60 ? "var(--amber)" : q.avgScore > 0 ? "var(--red)" : "var(--text3)" }}>{q.avgScore > 0 ? q.avgScore + "%" : "—"}</div><div className="quiz-stat-label">Avg Score</div></div>
                <div className="quiz-stat"><div className="quiz-stat-value">3</div><div className="quiz-stat-label">Sections</div></div>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="btn btn-ghost btn-sm flex-1"><Icon name="edit" size={12} /> Edit</button>
                <button className="btn btn-ghost btn-sm flex-1"><Icon name="chart" size={12} /> Results</button>
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
function CodingInterface() {
  const [lang, setLang] = useState("python");
  const [code, setCode] = useState(CODE_TEMPLATE);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [activeTab, setActiveTab] = useState("output");

  const lines = code.split("\n").length;

  const runCode = () => {
    setRunning(true);
    setOutput("");
    setTimeout(() => {
      setOutput("[0, 1]\n[1, 2]\n\nExecution time: 0.03ms | Memory: 14.2MB");
      setTestResults([
        { id: 1, name: "Basic test", input: "[2,7,11,15], 9", expected: "[0,1]", got: "[0,1]", pass: true, time: "0.01ms" },
        { id: 2, name: "Duplicate values", input: "[3,2,4], 6", expected: "[1,2]", got: "[1,2]", pass: true, time: "0.01ms" },
        { id: 3, name: "Negative numbers", input: "[-1,-2,-3,-4], -7", expected: "[2,3]", got: "[2,3]", pass: true, time: "0.01ms" },
        { id: 4, name: "Hidden test #1", input: "••••", expected: "••••", got: "••••", pass: true, time: "0.02ms" },
        { id: 5, name: "Hidden test #2", input: "••••", expected: "••••", got: "••••", pass: true, time: "0.02ms" },
      ]);
      setRunning(false);
    }, 1200);
  };

  return (
    <div className="fade-in" style={{ height: "calc(100vh - 100px)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "100%", gap: 0, border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        {/* Problem Panel */}
        <div style={{ borderRight: "1px solid var(--border)", overflowY: "auto", background: "var(--bg2)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <span className="badge badge-green">Easy</span>
            <span style={{ fontWeight: 600, color: "var(--text)" }}>Two Sum</span>
            <span className="badge badge-blue" style={{ marginLeft: "auto" }}>Array · Hash Map</span>
          </div>
          <div style={{ padding: 20 }}>
            <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 16, lineHeight: 1.8 }}>
              Given an array of integers <code style={{ background: "var(--bg3)", padding: "1px 5px", borderRadius: 4, fontFamily: "var(--mono)", color: "var(--accent2)" }}>nums</code> and an integer <code style={{ background: "var(--bg3)", padding: "1px 5px", borderRadius: 4, fontFamily: "var(--mono)", color: "var(--accent2)" }}>target</code>, return indices of the two numbers such that they add up to target.
            </p>
            <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 20, lineHeight: 1.8 }}>
              You may assume that each input would have exactly one solution, and you may not use the same element twice.
            </p>

            <div style={{ background: "var(--bg3)", borderRadius: "var(--radius)", padding: 14, marginBottom: 16, fontSize: 12, fontFamily: "var(--mono)" }}>
              <div className="text-faint mb-2" style={{ fontSize: 11, fontFamily: "var(--sans)", fontWeight: 600 }}>CONSTRAINTS</div>
              <div style={{ color: "var(--text2)", lineHeight: 2 }}>
                2 ≤ nums.length ≤ 10⁴<br />
                -10⁹ ≤ nums[i] ≤ 10⁹<br />
                -10⁹ ≤ target ≤ 10⁹<br />
                Only one valid answer exists.
              </div>
            </div>

            <div className="text-faint mb-2" style={{ fontSize: 11, fontWeight: 600 }}>SAMPLE I/O</div>
            {[
              { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", note: "nums[0] + nums[1] = 2 + 7 = 9" },
              { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
            ].map((ex, i) => (
              <div key={i} style={{ background: "var(--bg3)", borderRadius: "var(--radius)", padding: 12, marginBottom: 10, fontSize: 12, fontFamily: "var(--mono)" }}>
                <div style={{ color: "var(--text3)", marginBottom: 4 }}>Example {i + 1}:</div>
                <div style={{ color: "var(--text2)" }}>Input: {ex.input}</div>
                <div style={{ color: "var(--green)" }}>Output: {ex.output}</div>
                {ex.note && <div style={{ color: "var(--text3)", marginTop: 4 }}>// {ex.note}</div>}
              </div>
            ))}

            <div className="text-faint mb-2 mt-4" style={{ fontSize: 11, fontWeight: 600 }}>TEST CASES</div>
            <div style={{ display: "flex", gap: 8 }}>
              <span className="badge badge-blue">5 Public</span>
              <span className="badge badge-purple">10 Hidden</span>
            </div>
          </div>
        </div>

        {/* Editor + Output Panel */}
        <div style={{ display: "flex", flexDirection: "column", background: "var(--bg)" }}>
          <div style={{ padding: "8px 12px", background: "var(--bg2)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
            <select className="select" value={lang} onChange={e => setLang(e.target.value)} style={{ fontSize: 12, padding: "4px 8px" }}>
              <option value="python">Python 3</option>
              <option value="cpp">C++17</option>
              <option value="java">Java 17</option>
              <option value="c">C99</option>
            </select>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button className="btn btn-secondary btn-sm" onClick={runCode} disabled={running}>
                {running ? <span className="ai-loading"><span className="ai-dot"/><span className="ai-dot"/><span className="ai-dot"/></span> : <><Icon name="play" size={12} /> Run</>}
              </button>
              <button className="btn btn-primary btn-sm" onClick={runCode}><Icon name="send" size={12} /> Submit</button>
            </div>
          </div>

          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, overflowY: "auto", display: "flex" }}>
              <div style={{ padding: "16px 8px", color: "var(--text3)", fontFamily: "var(--mono)", fontSize: 12, lineHeight: 1.7, textAlign: "right", borderRight: "1px solid var(--border)", userSelect: "none", minWidth: 44 }}>
                {Array.from({ length: lines }, (_, i) => <div key={i}>{i + 1}</div>)}
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                style={{ flex: 1, background: "transparent", border: "none", color: "var(--text)", fontFamily: "var(--mono)", fontSize: 13, padding: "16px", resize: "none", lineHeight: 1.7, outline: "none" }}
                spellCheck={false}
              />
            </div>

            <div style={{ height: 220, borderTop: "1px solid var(--border)", background: "var(--bg2)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "6px 12px", borderBottom: "1px solid var(--border)" }}>
                {["output", "tests", "custom"].map(t => (
                  <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setActiveTab(t)}>
                    {t === "output" ? "Output" : t === "tests" ? `Test Cases (${testResults.filter(r => r.pass).length}/${testResults.length})` : "Custom Input"}
                  </button>
                ))}
                {testResults.length > 0 && (
                  <span className="badge badge-green" style={{ marginLeft: "auto" }}>
                    ✓ {testResults.filter(r => r.pass).length}/{testResults.length} passed
                  </span>
                )}
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
                {activeTab === "output" && (
                  <pre style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--green)", lineHeight: 1.7 }}>
                    {output || <span style={{ color: "var(--text3)" }}>Run your code to see output...</span>}
                  </pre>
                )}
                {activeTab === "tests" && testResults.map(r => (
                  <div key={r.id} className={`test-case ${r.pass ? "test-case-pass" : "test-case-fail"}`}>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 12, fontWeight: 600, color: r.pass ? "var(--green)" : "var(--red)" }}>
                        {r.pass ? "✓" : "✗"} {r.name}
                      </span>
                      <span className="text-xs text-faint">{r.time}</span>
                    </div>
                    {r.input !== "••••" && (
                      <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                        Input: {r.input} → {r.got}
                      </div>
                    )}
                  </div>
                ))}
                {activeTab === "custom" && (
                  <textarea className="input" style={{ height: "100%", resize: "none", fontFamily: "var(--mono)", fontSize: 12 }} placeholder="Enter custom input..." />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quiz Attempt Interface ────────────────────────────────────────────────────
function QuizAttempt() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState([]);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [showCheat, setShowCheat] = useState(false);
  const [violations, setViolations] = useState(0);

  const questions = [
    { id: 0, text: "Which data structure operates on LIFO (Last In, First Out) principle?", type: "mcq", opts: ["Queue", "Stack", "Array", "Linked List"], correct: 1, marks: 2 },
    { id: 1, text: "What is the time complexity of binary search on a sorted array?", type: "mcq", opts: ["O(n)", "O(n²)", "O(log n)", "O(1)"], correct: 2, marks: 2 },
    { id: 2, text: "Explain the difference between a stack and a queue with real-world examples.", type: "short", marks: 5 },
    { id: 3, text: "Implement a function that finds the maximum element in a binary search tree.", type: "coding", marks: 10 },
    { id: 4, text: "Refer to the diagram and identify the tree traversal order shown.", type: "image", marks: 3 },
  ];

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

  const triggerCheatWarning = () => {
    const newV = violations + 1;
    setViolations(newV);
    if (newV >= 3) { setShowCheat(true); return; }
    alert(`⚠ Warning ${newV}/3: Tab switching detected. Quiz will auto-submit after 3 violations.`);
  };

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
              <div style={{ background: "var(--bg3)", border: "1px dashed var(--border2)", borderRadius: "var(--radius)", height: 160, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, color: "var(--text3)", fontSize: 13 }}>
                📊 Tree traversal diagram (image placeholder)
              </div>
              <div className="form-group">
                <label className="form-label">Your answer</label>
                <input className="input" placeholder="e.g. In-order traversal" value={answers[current] || ""} onChange={e => setAnswers(a => ({ ...a, [current]: e.target.value }))} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <button className="btn btn-secondary" disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>← Previous</button>
            <button className="btn btn-ghost btn-sm" onClick={triggerCheatWarning} style={{ fontSize: 11, color: "var(--text3)" }}>Simulate Tab Switch</button>
            {current < questions.length - 1
              ? <button className="btn btn-primary" onClick={() => setCurrent(c => c + 1)}>Next →</button>
              : <button className="btn btn-success">Submit Quiz</button>}
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
function Classrooms({ role }) {
  const [joinCode, setJoinCode] = useState("");
  const colors = ["linear-gradient(135deg,#6c63ff,#a855f7)", "linear-gradient(135deg,#22d3a0,#4da6ff)", "linear-gradient(135deg,#f5a623,#ff5c5c)", "linear-gradient(135deg,#ec4899,#a855f7)"];

  const classes = [
    { id: 1, name: "Data Structures", code: "DS-2024", students: 48, quizzes: 6, instructor: "Prof. Sharma" },
    { id: 2, name: "Algorithm Design", code: "ALGO-101", students: 36, quizzes: 4, instructor: "Prof. Kumar" },
    { id: 3, name: "Database Systems", code: "DB-201", students: 52, quizzes: 8, instructor: "Prof. Reddy" },
  ];

  return (
    <div className="fade-in">
      <div className="section-head mb-6">
        <div>
          <div className="section-title">Classrooms</div>
          <div className="section-subtitle">{role === "teacher" ? "Manage your classes" : "Your enrolled classes"}</div>
        </div>
        {role === "teacher"
          ? <button className="btn btn-primary"><Icon name="plus" size={14} /> Create Classroom</button>
          : <div className="flex gap-2">
              <input className="input" placeholder="Enter invite code" value={joinCode} onChange={e => setJoinCode(e.target.value)} style={{ width: 160 }} />
              <button className="btn btn-primary btn-sm">Join</button>
            </div>
        }
      </div>

      <div className="grid-3">
        {classes.map((c, i) => (
          <div key={c.id} className="classroom-card card-hover">
            <div className="classroom-banner" style={{ background: colors[i % colors.length] }}>
              <div style={{ position: "absolute", top: 10, right: 10 }}>
                <span style={{ background: "rgba(0,0,0,0.3)", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontFamily: "var(--mono)", color: "white" }}>{c.code}</span>
              </div>
              <div style={{ fontFamily: "var(--serif)", fontWeight: 600, fontSize: 16, color: "white" }}>{c.name}</div>
            </div>
            <div className="classroom-info">
              <div className="flex gap-3 mb-3">
                <div className="stat-card flex-1" style={{ padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{c.students}</div>
                  <div className="text-xs text-faint">Students</div>
                </div>
                <div className="stat-card flex-1" style={{ padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{c.quizzes}</div>
                  <div className="text-xs text-faint">Quizzes</div>
                </div>
              </div>
              <div className="text-xs text-faint mb-3">{c.instructor}</div>
              <div className="flex gap-2">
                <button className="btn btn-secondary btn-sm flex-1">View</button>
                {role === "teacher" && <button className="btn btn-ghost btn-sm"><Icon name="settings" size={12} /></button>}
              </div>
            </div>
          </div>
        ))}

        {role === "teacher" && (
          <div className="classroom-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, border: "1px dashed var(--border2)", cursor: "pointer" }}>
            <div style={{ textAlign: "center", color: "var(--text3)" }}>
              <Icon name="plus" size={28} style={{ margin: "0 auto 8px", display: "block" }} />
              <div style={{ fontSize: 13 }}>New Classroom</div>
            </div>
          </div>
        )}
      </div>
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
  const [page, setPage] = useState("dashboard");
  const [quizzes, setQuizzes] = useState(() =>
  getFromStorage("quizzes", SAMPLE_QUIZZES)
);
useEffect(() => {
  saveToStorage("quizzes", quizzes);
}, [quizzes]);

  const handleLogin = (r) => {
  setRole(r);
  setAuthed(true);
  saveToStorage("role", r);
  saveToStorage("authed", true);
  setPage("dashboard");
};

  if (!authed) return <AuthScreen onLogin={handleLogin} />;

  const pageTitles = {
    dashboard: "Dashboard", classrooms: "Classrooms", quizzes: "Quiz Manager",
    questions: "Question Pool", coding: "Coding Interface", ai: "AI Generator",
    analytics: "Analytics", notifications: "Notifications", attempt: "Quiz Attempt",
  };

  const renderPage = () => {
  switch (page) {
    case "dashboard":
      return role === "teacher" ? (
        <TeacherDashboard quizzes={quizzes} />
      ) : (
        <StudentDashboard setPage={setPage} quizzes={quizzes} />
      );

    case "classrooms":
      return <Classrooms role={role} />;

    case "quizzes":
      return role === "teacher" ? (
        <QuizManager quizzes={quizzes} setQuizzes={setQuizzes} />
      ) : (
        <div className="fade-in">
          <div className="section-title mb-4">My Quizzes</div>
          {quizzes
            .filter((q) => q.status === "live")
            .map((q) => (
              <div key={q.id} className="quiz-card mb-3">
                <div className="quiz-card-header">
                  <div className="quiz-card-title">{q.title}</div>
                  <div className="quiz-card-meta">
                    <StatusBadge status={q.status} />
                    <span className="badge badge-gray">{q.duration}min</span>
                  </div>
                </div>
                <div className="quiz-card-body">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setPage("attempt")}
                  >
                    Start Quiz →
                  </button>
                </div>
              </div>
            ))}
        </div>
      );

    case "questions":
      return <QuestionPool />;

    case "coding":
      return <CodingInterface />;

    case "ai":
      return <AIGenerator />;

    case "analytics":
      return <Analytics role={role} />;

    case "notifications":
      return <Notifications />;

    case "attempt":
      return <QuizAttempt />;

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
    removeFromStorage("authed");
    removeFromStorage("role");
    setPage("dashboard");
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