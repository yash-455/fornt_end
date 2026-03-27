import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./css/clients.css";
import { createPortal } from "react-dom";

const API_BASE = "http://localhost:8000";

// ── SVG Icons ──
const IconSearch = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
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

export default function Clients() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [clients, setClients] = useState([]);
    const [allClients, setAllClients] = useState([]);
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

    // ── Fetch all clients ──
    const fetchClients = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append("search", searchQuery);

            const res = await fetch(`${API_BASE}/clients/get_all?${params.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` },
            });

            const data = await res.json();

            if (res.status === 404) {
                setClients([]);
                if (!searchQuery) setAllClients([]);
            } else if (Array.isArray(data)) {
                setClients(data);
                if (!searchQuery) setAllClients(data);
            } else {
                setClients([]);
            }
        } catch (err) {
            setError("Could not connect to server.");
            setClients([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (token) fetchClients();
    }, [searchQuery, token]);

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

    // ── Delete client ──
    const handleDelete = async (clientId) => {
        try {
            const res = await fetch(`${API_BASE}/clients/delete/${clientId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (res.ok) {
                setDeleteConfirmId(null);
                setOpenMenuId(null);
                fetchClients();
            }
        } catch (_) {}
    };

    if (!session) return null;

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const dropdownSuggestions = allClients.filter((c) =>
        searchQuery
            ? c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.email?.toLowerCase().includes(searchQuery.toLowerCase())
            : true
    );

    return (
        <div className="dash-layout">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(v => !v)} session={session} />

            <main className="dash-main">
                <header className="dash-topbar">
                    <div className="topbar-left">
                        <h1 className="topbar-title">Client Management</h1>
                        <span className="topbar-subtitle">View and manage your client database</span>
                    </div>
                    <div className="topbar-right">
                        <button className="topbar-icon-btn">
                            <IconBell />
                            <span className="notification-dot" />
                        </button>
                        <div className="topbar-avatar">{getInitials(session.name)}</div>
                    </div>
                </header>

                <div className="clients-content">
                    <div className="clients-toolbar">
                        <div className="toolbar-left">
                            {/* Search with dropdown */}
                            <div className="search-bar" ref={searchRef} style={{ position: "relative" }}>
                                <span className="search-icon"><IconSearch /></span>
                                <input
                                    type="text"
                                    placeholder="Search by client name or email..."
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
                                                onMouseDown={() => { setShowDropdown(false); navigate(`/clients/${c.id}`); }}
                                            >
                                                <span className="dropdown-client-name">{c.name}</span>
                                                <span className="dropdown-client-email">{c.email}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button className="new-client-btn" onClick={() => navigate("/clients/add")}>
                            <IconPlus />
                            <span>Add Client</span>
                        </button>
                    </div>

                    {/* Clients Table */}
                    <div className="clients-table-card">
                        <div className="table-responsive">
                            <table className="clients-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Address</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="5" className="no-results">Loading clients...</td></tr>
                                    ) : error ? (
                                        <tr><td colSpan="5" className="no-results">{error}</td></tr>
                                    ) : clients.length > 0 ? (
                                        clients.map((c) => (
                                            <tr key={c.id} onClick={() => navigate(`/clients/${c.id}`)} style={{ cursor: "pointer" }}>
                                                <td>
                                                    <div className="client-name-cell">{c.name}</div>
                                                </td>
                                                <td className="detail-cell">{c.email || "—"}</td>
                                                <td className="detail-cell">{c.phone || "—"}</td>
                                                <td className="detail-cell">{c.address || "—"}</td>
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
                                        <tr><td colSpan="5" className="no-results">No clients found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Action Menu */}
                    {openMenuId && createPortal(
                        <div
                            className="action-menu"
                            ref={menuRef}
                            style={{ position: "fixed", top: menuPos.top, left: menuPos.left, zIndex: 9999 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="action-menu-item"
                                onClick={() => { setOpenMenuId(null); navigate(`/clients/edit/${openMenuId}`); }}
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
                        <div className="modal-title">Delete Client</div>
                        <div className="modal-desc">Are you sure you want to delete this client? This action cannot be undone and may affect associated cases.</div>
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