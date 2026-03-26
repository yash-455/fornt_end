import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./css/cases.css";
import { createPortal } from "react-dom";

const API_BASE = "http://localhost:8000";

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

export default function Cases() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [cases, setCases] = useState([]);
    const [allCases, setAllCases] = useState([]);
    const [clientMap, setClientMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const searchRef = useRef(null);
    const menuRef = useRef(null);

    const session = JSON.parse(localStorage.getItem("trialdesk_session") || "null");
    const token = session?.token;

    useEffect(() => {
        if (!session) navigate("/", { replace: true });
    }, [session, navigate]);

    // ── Fetch all clients once and build a map ──
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await fetch(`${API_BASE}/clients/get_all`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });
                const data = await res.json();
                if (Array.isArray(data)) {
                    const map = {};
                    data.forEach((cl) => { map[cl.id] = cl.name; });
                    setClientMap(map);
                }
            } catch (_) {}
        };
        if (token) fetchClients();
    }, [token]);

    // ── Fetch all cases once for the search dropdown ──
    useEffect(() => {
        const fetchAllCases = async () => {
            try {
                const res = await fetch(`${API_BASE}/cases/get_all`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });
                const data = await res.json();
                if (Array.isArray(data)) setAllCases(data);
            } catch (_) {}
        };
        if (token) fetchAllCases();
    }, [token]);

    // ── Fetch filtered cases ──
    const fetchCases = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append("name", searchQuery);
            if (statusFilter !== "All") params.append("status", statusFilter.toLowerCase());

            const res = await fetch(`${API_BASE}/cases/get_all?${params.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` },
            });

            const data = await res.json();

            if (res.status === 404) {
                setCases([]);
            } else if (Array.isArray(data)) {
                setCases(data);
            } else {
                setCases([]);
            }
        } catch (err) {
            setError("Could not connect to server.");
            setCases([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (token) fetchCases();
    }, [searchQuery, statusFilter, token]);

    // ── Close dropdowns on outside click ──
    useEffect(() => {
        const handleClick = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // ── Delete case ──
    const handleDelete = async (caseId) => {
        try {
            const res = await fetch(`${API_BASE}/cases/delete/${caseId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (res.ok) {
                setDeleteConfirmId(null);
                setOpenMenuId(null);
                fetchCases();
            }
        } catch (_) {}
    };

    if (!session) return null;

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        try {
            return new Date(dateStr).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric"
            });
        } catch {
            return dateStr;
        }
    };

    const dropdownSuggestions = allCases.filter((c) =>
        searchQuery
            ? c.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.case_name.toLowerCase().includes(searchQuery.toLowerCase())
            : true
    );

    return (
        <div className="dash-layout">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(v => !v)} session={session} />

            <main className="dash-main">
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
                    <div className="cases-toolbar">
                        <div className="toolbar-left">

                            {/* Search with dropdown */}
                            <div className="search-bar" ref={searchRef} style={{ position: "relative" }}>
                                <span className="search-icon"><IconSearch /></span>
                                <input
                                    type="text"
                                    placeholder="Search by case ID or matter..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                                    onFocus={() => setShowDropdown(true)}
                                />
                                {showDropdown && dropdownSuggestions.length > 0 && (
                                    <div className="search-dropdown">
                                        {dropdownSuggestions.map((c) => (
                                            <div
                                                key={c.id}
                                                className="search-dropdown-item"
                                                onMouseDown={() => { setShowDropdown(false); navigate(`/cases/${c.id}`); }}
                                            >
                                                <span className="dropdown-case-id">{c.case_number}</span>
                                                <span className="dropdown-case-name">{c.case_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="filter-group">
                                <span className="filter-icon"><IconFilter /></span>
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="status-select">
                                    <option value="All">All Statuses</option>
                                    <option value="Open">Open</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                        </div>
                        <button className="new-case-btn" onClick={() => navigate("/cases/add")}>
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
                                        <th>Type</th>
                                        <th>Court</th>
                                        <th>Date Opened</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="7" className="no-results">Loading cases...</td></tr>
                                    ) : error ? (
                                        <tr><td colSpan="7" className="no-results">{error}</td></tr>
                                    ) : cases.length > 0 ? (
                                        cases.map((c) => (
                                            <tr key={c.id} onClick={() => navigate(`/cases/${c.id}`)} style={{ cursor: "pointer" }}>
                                                <td className="case-id">{c.case_number}</td>
                                                <td>
                                                    <div className="matter-cell">
                                                        <div className="matter-name">{c.case_name}</div>
                                                        <div className="client-name">{clientMap[c.client_id] || "—"}</div>
                                                    </div>
                                                </td>
                                                <td className="type-cell">{c.case_type}</td>
                                                <td className="type-cell">{c.court || "—"}</td>
                                                <td className="date-cell">{formatDate(c.filing_date)}</td>
                                                <td>
                                                    <span className={`status-pill ${c.status?.toLowerCase()}`}>{c.status}</span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="action-dots"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            setMenuPos({
                                                                top: rect.bottom + 4,
                                                                left: rect.right - 140,
                                                            });
                                                            setOpenMenuId(openMenuId === c.id ? null : c.id);
                                                        }}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="7" className="no-results">No cases found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Action Menu — rendered outside table to avoid clipping */}
                    {openMenuId && createPortal(
                        <div
                            className="action-menu"
                            ref={menuRef}
                            style={{ position: "fixed", top: menuPos.top, left: menuPos.left, zIndex: 9999 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="action-menu-item"
                                onClick={() => { setOpenMenuId(null); navigate(`/cases/edit/${openMenuId}`); }}
                            >
                                ✏️ Update
                            </button>
                            <button
                                className="action-menu-item action-menu-delete"
                                onClick={() => { setDeleteConfirmId(openMenuId); setOpenMenuId(null); }}
                            >
                                🗑️ Delete
                            </button>
                        </div>,
                        document.body
                    )}
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-title">Delete Case</div>
                        <div className="modal-desc">Are you sure you want to delete this case? This action cannot be undone.</div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                            <button className="btn-delete" onClick={() => handleDelete(deleteConfirmId)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}