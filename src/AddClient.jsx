import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./css/addclient.css";

const API_BASE = "http://localhost:8000";

// ── SVG Icons ──
const IconBell = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);
const IconArrowLeft = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
);

export default function AddClient() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    
    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    
    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const session = JSON.parse(localStorage.getItem("trialdesk_session") || "null");
    const token = session?.token;

    useEffect(() => {
        if (!session) navigate("/", { replace: true });
    }, [session, navigate]);

    if (!session) return null;

    const getInitials = (nameStr) => {
        if (!nameStr) return "U";
        return nameStr.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Client Name is required.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const payload = {
            name: name.trim(),
            email: email.trim() || null,
            phone: phone.trim() || null
        };

        try {
            // Adjust the exact endpoint route if your backend uses a different path (e.g., /clients/ instead of /clients/add)
            const res = await fetch(`${API_BASE}/clients/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                navigate("/clients");
            } else {
                const data = await res.json();
                setError(data.detail || "Failed to add client. Please try again.");
            }
        } catch (err) {
            setError("Could not connect to the server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="dash-layout">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(v => !v)} session={session} />

            <main className="dash-main">
                <header className="dash-topbar">
                    <div className="topbar-left">
                        <button className="back-btn" onClick={() => navigate("/clients")}>
                            <IconArrowLeft />
                        </button>
                        <div>
                            <h1 className="topbar-title">Add New Client</h1>
                            <span className="topbar-subtitle">Enter client details to create a new profile</span>
                        </div>
                    </div>
                    <div className="topbar-right">
                        <button className="topbar-icon-btn">
                            <IconBell />
                            <span className="notification-dot" />
                        </button>
                        <div className="topbar-avatar">{getInitials(session.name)}</div>
                    </div>
                </header>

                <div className="add-client-content">
                    <div className="form-card">
                        {error && <div className="form-error-banner">{error}</div>}
                        
                        <form onSubmit={handleSubmit} className="client-form">
                            
                            {/* Required Name Field */}
                            <div className="form-group full-width">
                                <label className="form-label">
                                    Client Name <span className="required-asterisk">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter full name or company name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Optional Contact Fields */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">
                                        Email Address <span className="optional-tag">(Optional)</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="client@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        Phone Number <span className="optional-tag">(Optional)</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        placeholder="+1 (555) 000-0000"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="btn-form-cancel" 
                                    onClick={() => navigate("/clients")}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-form-submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Saving..." : "Save Client"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}