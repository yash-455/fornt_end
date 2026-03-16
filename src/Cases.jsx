import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { MOCK_CASES } from "./theme";
import "./cases.css";

// ── SVG Icons (Cases Specific) ──
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
const IconPlus = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const IconBell = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

// ── Mock Cases Data ──
// Mock cases moved to theme.js

export default function Cases() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Get logged-in user
    const session = JSON.parse(localStorage.getItem("trialdesk_session") || "null");

    useEffect(() => {
        if (!session) {
            navigate("/", { replace: true });
        }
    }, [session, navigate]);

    if (!session) return null;

    const filteredCases = MOCK_CASES.filter(c => {
        const matchesSearch = c.case_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.case_number.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All" || c.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

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

            <main className="dash-main">
                {/* Top Bar */}
                <header className="dash-topbar">
                    <div className="topbar-left">
                        <h1 className="topbar-title">Case Management</h1>
                        <span className="topbar-subtitle">View and manage all active legal matters</span>
                    </div>
                    <div className="topbar-right">
                        <button className="topbar-icon-btn">
                            <IconBell />
                            <span className="notification-dot" />
                        </button>
                        <div className="topbar-avatar">{getInitials(session.name)}</div>
                    </div>
                </header>

                <div className="cases-content">
                    {/* Toolbar */}
                    <div className="cases-toolbar">
                        <div className="toolbar-left">
                            <div className="search-bar">
                                <span className="search-icon"><IconSearch /></span>
                                <input
                                    type="text"
                                    placeholder="Search by ID, client, or matter..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <span className="filter-icon"><IconFilter /></span>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="status-select"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Open">Open</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                        </div>
                        <button className="new-case-btn">
                            <IconPlus />
                            <span>New Case</span>
                        </button>
                    </div>

                    {/* Cases Table */}
                    <div className="cases-table-card">
                        <div className="table-responsive">
                            <table className="cases-table">
                                <thead>
                                    <tr>
                                        <th>Case ID</th>
                                        <th>Matter / Client</th>
                                        <th>Assigned Lawyer</th>
                                        <th>Practice Area</th>
                                        <th>Date Opened</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCases.length > 0 ? (
                                        filteredCases.map((c) => (
                                            <tr key={c.id} onClick={() => navigate(`/cases/${c.id}`)} style={{ cursor: 'pointer' }}>
                                                <td className="case-id">{c.case_number}</td>
                                                <td>
                                                    <div className="matter-cell">
                                                        <div className="matter-name">{c.case_name}</div>
                                                        <div className="client-name">{c.client_name}</div>
                                                    </div>
                                                </td>
                                                <td className="lawyer-cell">Robert Vance</td>
                                                <td className="type-cell">Civil Litigation</td>
                                                <td className="date-cell">{c.filing_date}</td>
                                                <td>
                                                    <span className={`status-pill ${c.status.toLowerCase()}`}>
                                                        {c.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="action-dots" onClick={(e) => { e.stopPropagation(); }}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="no-results">No cases found matching your criteria.</td>
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
