import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

// Scales logo
const ScalesLogo = () => (
    <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="48" y="10" width="4" height="55" fill="#D4AF37" />
        <circle cx="50" cy="10" r="4" fill="#D4AF37" />
        <rect x="15" y="28" width="70" height="3" rx="1.5" fill="#D4AF37" />
        <line x1="25" y1="31" x2="22" y2="52" stroke="#D4AF37" strokeWidth="2" />
        <line x1="75" y1="31" x2="78" y2="52" stroke="#D4AF37" strokeWidth="2" />
        <path d="M10 52 Q22 58 34 52" stroke="#D4AF37" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <line x1="10" y1="52" x2="34" y2="52" stroke="#D4AF37" strokeWidth="1.5" />
        <path d="M66 52 Q78 58 90 52" stroke="#D4AF37" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <line x1="66" y1="52" x2="90" y2="52" stroke="#D4AF37" strokeWidth="1.5" />
        <ellipse cx="50" cy="68" rx="22" ry="5" fill="#D4AF37" opacity="0.9" />
        <rect x="29" y="63" width="42" height="8" rx="2" fill="#D4AF37" opacity="0.8" />
    </svg>
);

// ── SVG Icons ──
const IconDashboard = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
);
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
const IconLogout = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const navItems = [
    { id: "dashboard", label: "Dashboard", icon: IconDashboard, path: "/dashboard" },
    { id: "cases", label: "Cases", icon: IconBriefcase, path: "/cases" },
    { id: "hearings", label: "Hearings", icon: IconCalendar, path: "/hearings" },
    { id: "documents", label: "Documents", icon: IconFile, path: "/documents" },
    { id: "assistant", label: "AI Assistant", icon: IconBot, path: "/assistant" },
];

export default function Sidebar({ isOpen, toggleSidebar, session }) {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("trialdesk_session");
        navigate("/");
    };

    return (
        <aside className={`dash-sidebar ${isOpen ? "" : "collapsed"}`}>
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <ScalesLogo />
                    {isOpen && <span className="sidebar-brand-name">TrialDesk</span>}
                </div>
                <button className="sidebar-toggle" onClick={toggleSidebar}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span className="nav-icon"><item.icon /></span>
                        {isOpen && <span className="nav-label">{item.label}</span>}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="nav-item logout-item" onClick={handleLogout}>
                    <span className="nav-icon"><IconLogout /></span>
                    {isOpen && <span className="nav-label">Logout</span>}
                </button>
            </div>
        </aside>
    );
}
