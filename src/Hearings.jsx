import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./hearings.css";

// ── SVG Icons ──
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

// ── Mock Hearings Data ──
const mockHearings = [
    { id: "H-2001", caseName: "Smith v. Anderson Corp", date: "Mar 25, 2024", time: "10:30 AM", court: "Superior Court", purpose: "Motion to Dismiss", status: "Scheduled" },
    { id: "H-2002", caseName: "Johnson Estate Trust", date: "Mar 28, 2024", time: "02:15 PM", court: "Probate Court", purpose: "Final Accounting", status: "Scheduled" },
    { id: "H-2003", caseName: "TechStart IP Dispute", date: "Apr 05, 2024", time: "09:00 AM", court: "Federal Court", purpose: "Pre-trial Conference", status: "Scheduled" },
    { id: "H-2004", caseName: "Rivera Family Trust", date: "Feb 20, 2024", time: "11:00 AM", court: "Family Court", purpose: "Settlement", status: "Completed" },
    { id: "H-2005", caseName: "GlobalTrade v. Peak", date: "Apr 12, 2024", time: "01:30 PM", court: "Superior Court", purpose: "Evidentiary Hearing", status: "Tentative" },
    { id: "H-2006", caseName: "Wong Employment Claim", date: "Mar 18, 2024", time: "10:00 AM", court: "Arbitration Tribunal", purpose: "Initial Hearing", status: "Cancelled" },
];

export default function Hearings() {
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

    const filteredHearings = mockHearings.filter(h => {
        const matchesSearch = h.caseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.court.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All" || h.status === statusFilter;
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
                    {/* Toolbar */}
                    <div className="hearings-toolbar">
                        <div className="toolbar-left">
                            <div className="search-bar">
                                <span className="search-icon"><IconSearch /></span>
                                <input
                                    type="text"
                                    placeholder="Search by ID, case, or court..."
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
                                    <option value="Scheduled">Scheduled</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Tentative">Tentative</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                        <button className="new-hearing-btn">
                            <IconCalendar />
                            <span>Schedule Hearing</span>
                        </button>
                    </div>

                    {/* Hearings Table */}
                    <div className="hearings-table-card">
                        <div className="table-responsive">
                            <table className="hearings-table">
                                <thead>
                                    <tr>
                                        <th>Hearing ID</th>
                                        <th>Case Name</th>
                                        <th>Date & Time</th>
                                        <th>Court / Location</th>
                                        <th>Purpose</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHearings.length > 0 ? (
                                        filteredHearings.map((h) => (
                                            <tr key={h.id}>
                                                <td className="hearing-id">{h.id}</td>
                                                <td>
                                                    <div className="case-name-cell">{h.caseName}</div>
                                                </td>
                                                <td>
                                                    <div className="datetime-cell">
                                                        <div className="hearing-date">{h.date}</div>
                                                        <div className="hearing-time">{h.time}</div>
                                                    </div>
                                                </td>
                                                <td className="court-cell">{h.court}</td>
                                                <td className="purpose-cell">{h.purpose}</td>
                                                <td>
                                                    <span className={`status-pill ${h.status.toLowerCase()}`}>
                                                        {h.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="action-dots">
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="no-results">No hearings found matching your criteria.</td>
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
