import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";

export default function AddDocument() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const session = JSON.parse(localStorage.getItem("trialdesk_session") || "null");

    useEffect(() => {
        if (!session) navigate("/", { replace: true });
    }, [session, navigate]);

    if (!session) return null;

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="dash-layout">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen((v) => !v)} session={session} />

            <main className="dash-main">
                <header className="dash-topbar">
                    <div className="topbar-left">
                        <h1 className="topbar-title">Add Document</h1>
                        <span className="topbar-subtitle">Upload form placeholder page</span>
                    </div>
                    <div className="topbar-right">
                        <div className="topbar-avatar">{getInitials(session.name)}</div>
                    </div>
                </header>

                <div style={{ padding: "24px 32px" }}>
                    <div style={{
                        background: "#0a0a0a",
                        border: "1px solid #222222",
                        borderRadius: "12px",
                        padding: "24px"
                    }}>
                        <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Add Document Page</div>
                        <div style={{ color: "#888888", marginBottom: "18px" }}>
                            This is a placeholder route so the Add Docs button works. You can build the upload form here next.
                        </div>
                        <button
                            onClick={() => navigate("/documents")}
                            style={{
                                background: "#ffffff",
                                color: "#000000",
                                border: "none",
                                borderRadius: "8px",
                                padding: "10px 16px",
                                fontWeight: 600,
                                cursor: "pointer"
                            }}
                        >
                            Back to Documents
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
