import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./css/dashboard.css";

// ── SVG Icons (Dashboard Specific) ──
const IconBriefcase = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
);
const IconCalendar = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);
const IconFile = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
);
const IconBot = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><line x1="12" y1="7" x2="12" y2="11" />
        <circle cx="8" cy="16" r="1" fill="currentColor" /><circle cx="16" cy="16" r="1" fill="currentColor" />
    </svg>
);
const IconBell = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);
const IconPlus = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const IconSearch = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IconTrendUp = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
);

// ── Mock data ──
const mockActivity = [
    { id: 1, case: "Smith v. Anderson Corp", action: "Brief filed", date: "Mar 14, 2026", status: "completed", type: "Filing" },
    { id: 2, case: "Johnson Estate Trust", action: "Client meeting scheduled", date: "Mar 15, 2026", status: "upcoming", type: "Meeting" },
    { id: 3, case: "TechStart IP Dispute", action: "Discovery documents uploaded", date: "Mar 13, 2026", status: "completed", type: "Document" },
    { id: 4, case: "Rivera Family Trust", action: "Hearing at District Court", date: "Mar 18, 2026", status: "upcoming", type: "Hearing" },
    { id: 5, case: "GlobalTrade LLC v. Peak", action: "Settlement draft reviewed", date: "Mar 12, 2026", status: "completed", type: "Review" },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Get logged-in user
    const session = JSON.parse(localStorage.getItem("trialdesk_session") || "null");

    useEffect(() => {
        if (!session) {
            navigate("/", { replace: true });
        }
    }, [session, navigate]);

    if (!session) return null;

    const stats = [
        { label: "Active Cases", value: "24", change: "+3 this month", icon: IconBriefcase, color: "#D4AF37" },
        { label: "Upcoming Hearings", value: "8", change: "Next: Mar 18", icon: IconCalendar, color: "#60A5FA" },
        { label: "Pending Documents", value: "12", change: "5 need review", icon: IconFile, color: "#34D399" },
        { label: "AI Queries", value: "156", change: "+28 this week", icon: IconBot, color: "#A78BFA" },
    ];

    const getInitials = (name) => {
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="dash-layout">
            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(v => !v)}
                session={session}
            />

            {/* ── MAIN CONTENT ── */}
            <main className="dash-main">
                {/* Top Bar */}
                <header className="dash-topbar">
                    <div className="topbar-left">
                        <h1 className="topbar-title">Dashboard</h1>
                        <span className="topbar-subtitle">Welcome back, {session.name}</span>
                    </div>
                    <div className="topbar-right">
                        <div className="search-bar">
                            <span className="search-icon"><IconSearch /></span>
                            <input type="text" placeholder="Search cases, documents..." />
                        </div>
                        <button className="topbar-icon-btn notification-btn">
                            <IconBell />
                            <span className="notification-dot" />
                        </button>
                        <div className="topbar-avatar">
                            {getInitials(session.name)}
                        </div>
                    </div>
                </header>

                {/* Stats Grid */}
                <section className="stats-grid">
                    {stats.map((s, i) => (
                        <div className="stat-card" key={i}>
                            <div className="stat-icon-wrap" style={{ background: `${s.color}15`, color: s.color }}>
                                <s.icon />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{s.value}</span>
                                <span className="stat-label">{s.label}</span>
                                <span className="stat-change">
                                    <IconTrendUp />
                                    {s.change}
                                </span>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Content Grid */}
                <div className="content-grid">
                    {/* Recent Activity */}
                    <section className="activity-section">
                        <div className="section-header">
                            <h2 className="section-title">Recent Activity</h2>
                            <button className="view-all-btn">View All</button>
                        </div>
                        <div className="activity-table-wrap">
                            <table className="activity-table">
                                <thead>
                                    <tr>
                                        <th>Case</th>
                                        <th>Action</th>
                                        <th>Type</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockActivity.map((row) => (
                                        <tr key={row.id}>
                                            <td className="case-name">{row.case}</td>
                                            <td>{row.action}</td>
                                            <td><span className="type-badge">{row.type}</span></td>
                                            <td className="date-cell">{row.date}</td>
                                            <td>
                                                <span className={`status-badge ${row.status}`}>
                                                    {row.status === "completed" ? "✓ Completed" : "◷ Upcoming"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="quick-actions-section">
                        <h2 className="section-title">Quick Actions</h2>
                        <div className="quick-actions-grid">
                            {[
                                { label: "New Case", icon: IconBriefcase },
                                { label: "Schedule Hearing", icon: IconCalendar },
                                { label: "Upload Document", icon: IconFile },
                                { label: "Ask AI Assistant", icon: IconBot, path: "/assistant" },
                            ].map((action, i) => (
                                <button
                                    className="quick-action-card"
                                    key={i}
                                    onClick={() => action.path && navigate(action.path)}
                                >
                                    <span className="quick-action-icon"><action.icon /></span>
                                    <span className="quick-action-plus"><IconPlus /></span>
                                    <span className="quick-action-label">{action.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Firm Info Card */}
                        <div className="firm-card">
                            <div className="firm-card-header">
                                <div className="firm-avatar">{getInitials(session.firm || "TF")}</div>
                                <div>
                                    <div className="firm-name">{session.firm}</div>
                                    <div className="firm-email">{session.email}</div>
                                </div>
                            </div>
                            <div className="firm-stats">
                                <div className="firm-stat">
                                    <span className="firm-stat-value">24</span>
                                    <span className="firm-stat-label">Cases</span>
                                </div>
                                <div className="firm-stat">
                                    <span className="firm-stat-value">3</span>
                                    <span className="firm-stat-label">Members</span>
                                </div>
                                <div className="firm-stat">
                                    <span className="firm-stat-value">98%</span>
                                    <span className="firm-stat-label">Win Rate</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
