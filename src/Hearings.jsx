import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./css/hearings.css";

const API_BASE = "http://localhost:8000";

const IconSearch = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);
const IconFilter = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);
const IconBell = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);
const IconCalendar = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const OUTCOMES = ["Adjourned", "Pending", "Arguments heard", "Decided — Plaintiff", "Decided — Defendant", "Settled", "Dismissed"];

// ── Days until next hearing ──
const getDaysLabel = (dateStr) => {
    if (!dateStr) return null;
    const now = new Date();
    const next = new Date(dateStr);
    now.setHours(0, 0, 0, 0);
    next.setHours(0, 0, 0, 0);
    const diff = Math.round((next - now) / (1000 * 60 * 60 * 24));
    if (diff === 0) return { label: "Today", cls: "days-today" };
    if (diff === 1) return { label: "Tomorrow", cls: "days-soon" };
    if (diff < 0) return { label: `${Math.abs(diff)}d ago`, cls: "days-past" };
    if (diff <= 7) return { label: `In ${diff} days`, cls: "days-soon" };
    return { label: `In ${diff} days`, cls: "days-normal" };
};

export default function Hearings() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [outcomeFilter, setOutcomeFilter] = useState("All");
    const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" | "past"
    const [hearings, setHearings] = useState([]);
    const [caseMap, setCaseMap] = useState({});
    const [loading, setLoading] = useState(true);

    const session = JSON.parse(localStorage.getItem("trialdesk_session") || "null");
    const token = session?.token;

    useEffect(() => {
        if (!session) navigate("/", { replace: true });
    }, [session, navigate]);

    // ── Fetch cases for mapping ──
    useEffect(() => {
        const fetchCases = async () => {
            try {
                const res = await fetch(`${API_BASE}/cases/get_all`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });
                const data = await res.json();
                if (Array.isArray(data)) {
                    const map = {};
                    data.forEach((c) => { map[c.id] = { case_number: c.case_number, case_name: c.case_name, status: c.status }; });
                    setCaseMap(map);
                }
            } catch (_) {}
        };
        if (token) fetchCases();
    }, [token]);

    // ── Fetch hearings ──
    useEffect(() => {
        const fetchHearings = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/hearings/get`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });
                const data = await res.json();
                setHearings(Array.isArray(data) ? data : []);
            } catch (_) { setHearings([]); }
            setLoading(false);
        };
        if (token) fetchHearings();
    }, [token]);

    if (!session) return null;

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        try {
            return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        } catch { return dateStr; }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        try {
            return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
        } catch { return ""; }
    };

    const now = new Date();

    // ── Split into upcoming and past by next_date ──
    const upcomingHearings = hearings
        .filter(h => h.next_date && new Date(h.next_date) >= now)
        .sort((a, b) => new Date(a.next_date) - new Date(b.next_date)); // soonest first

    const pastHearings = hearings
        .filter(h => !h.next_date || new Date(h.next_date) < now)
        .sort((a, b) => new Date(b.next_date) - new Date(a.next_date)); // most recent first

    const activeHearings = activeTab === "upcoming" ? upcomingHearings : pastHearings;

    const filteredHearings = activeHearings.filter(h => {
        const caseInfo = caseMap[h.case_id] || {};
        const matchSearch = !searchQuery ||
            caseInfo.case_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            caseInfo.case_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.judge?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.outcome?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchOutcome = outcomeFilter === "All" || h.outcome === outcomeFilter;
        return matchSearch && matchOutcome;
    });

    const caseStatusColor = (status) => {
        if (status === "open") return "#4ade80";
        if (status === "pending") return "#facc15";
        return "#888888";
    };

    return (
        <div className="dash-layout">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(v => !v)} session={session} />

            <main className="dash-main">
                <header className="dash-topbar">
                    <div className="topbar-left">
                        <h1 className="topbar-title">Hearings & Calendar</h1>
                        <span className="topbar-subtitle">Track and manage all upcoming court sessions</span>
                    </div>
                    <div className="topbar-right">
                        <button className="topbar-icon-btn">
                            <IconBell />
                            <span className="notification-dot" />
                        </button>
                        <div className="topbar-avatar">{getInitials(session.name)}</div>
                    </div>
                </header>

                <div className="hearings-content">

                    {/* ── Upcoming / Past Tabs ── */}
                    <div className="hearings-tabs">
                        <button
                            className={`hearings-tab ${activeTab === "upcoming" ? "active" : ""}`}
                            onClick={() => setActiveTab("upcoming")}
                        >
                            Upcoming
                            <span className="tab-count">{upcomingHearings.length}</span>
                        </button>
                        <button
                            className={`hearings-tab ${activeTab === "past" ? "active" : ""}`}
                            onClick={() => setActiveTab("past")}
                        >
                            Past
                            <span className="tab-count">{pastHearings.length}</span>
                        </button>
                    </div>

                    <div className="hearings-toolbar">
                        <div className="toolbar-left">
                            <div className="search-bar">
                                <span className="search-icon"><IconSearch /></span>
                                <input
                                    type="text"
                                    placeholder="Search by case ID, name, judge..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <span className="filter-icon"><IconFilter /></span>
                                <select value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)} className="status-select">
                                    <option value="All">All Outcomes</option>
                                    {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>
                        <button className="new-hearing-btn" onClick={() => navigate("/hearings/schedule")}>
                            <IconCalendar />
                            <span>Schedule Hearing</span>
                        </button>
                    </div>

                    <div className="hearings-table-card">
                        <div className="table-responsive">
                            <table className="hearings-table">
                                <thead>
                                    <tr>
                                        <th>Case</th>
                                        <th>Hearing Date</th>
                                        <th>Judge</th>
                                        <th>Outcome</th>
                                        <th>Next Date</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" className="no-results">Loading hearings...</td></tr>
                                    ) : filteredHearings.length > 0 ? (
                                        filteredHearings.map((h) => {
                                            const caseInfo = caseMap[h.case_id] || {};
                                            const daysInfo = getDaysLabel(h.next_date);
                                            return (
                                                <tr key={h.id}>
                                                    <td>
                                                        <div className="hearing-case-number">{caseInfo.case_number || h.case_id}</div>
                                                        <div className="hearing-case-name">{caseInfo.case_name || "—"}</div>
                                                        {caseInfo.status && (
                                                            <span className="hearing-case-status" style={{ color: caseStatusColor(caseInfo.status) }}>
                                                                ● {caseInfo.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="hearing-date">{formatDate(h.date)}</div>
                                                    </td>
                                                    <td>{h.judge || "—"}</td>
                                                    <td>
                                                        <span className="status-pill">{h.outcome}</span>
                                                    </td>
                                                    <td>
                                                        <div className="hearing-date">{formatDate(h.next_date)}</div>
                                                        <div className="hearing-time">{formatTime(h.next_date)}</div>
                                                        {daysInfo && (
                                                            <span className={`days-label ${daysInfo.cls}`}>{daysInfo.label}</span>
                                                        )}
                                                    </td>
                                                    <td className="notes-cell">{h.notes || "—"}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="no-results">
                                                No {activeTab} hearings found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}