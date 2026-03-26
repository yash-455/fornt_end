import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import Sidebar from "./components/Sidebar";
import "./css/addcase.css";

const API_BASE = "http://localhost:8000";

const CASE_TYPES = [
    "criminal", "civil", "family", "corporate",
    "intellectual_property", "immigration", "labor", "tax", "other"
];

const CASE_STAGES = [
    "filing", "discovery", "pre_trial", "trial",
    "verdict", "appeal", "enforcement", "closed"
];

const CASE_STATUSES = ["open", "pending", "closed"];

const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
);

export default function AddCase() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [filingDate, setFilingDate] = useState(null);
    const [dateDisplay, setDateDisplay] = useState("");
    const dateInputRef = useRef(null);
    const fpInstance = useRef(null);

    const session = JSON.parse(localStorage.getItem("trialdesk_session") || "null");
    const token = session?.token;

    const [form, setForm] = useState({
        case_number: "",
        case_name: "",
        case_type: "",
        status: "open",
        current_stage: "filing",
        client_id: "",
        court: "",
        notes: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!session) navigate("/", { replace: true });
    }, [session, navigate]);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await fetch(`${API_BASE}/clients/get_all`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });
                const data = await res.json();
                if (Array.isArray(data)) setClients(data);
            } catch (_) {}
        };
        if (token) fetchClients();
    }, [token]);

    // ── Init flatpickr ──
    useEffect(() => {
        if (!dateInputRef.current) return;

        fpInstance.current = flatpickr(dateInputRef.current, {
            dateFormat: "d M Y",
            disableMobile: true,
            onChange: (selectedDates, dateStr) => {
                setFilingDate(selectedDates[0] || null);
                setDateDisplay(dateStr);
            },
        });

        return () => {
            if (fpInstance.current) fpInstance.current.destroy();
        };
    }, []);

    const setField = (key) => (e) => {
        setForm((p) => ({ ...p, [key]: e.target.value }));
        setErrors((p) => ({ ...p, [key]: undefined }));
        setError(null);
    };

    const validate = () => {
        const errs = {};
        if (!form.case_number.trim()) errs.case_number = "Case number is required";
        if (!form.case_name.trim()) errs.case_name = "Case name is required";
        if (!form.case_type) errs.case_type = "Case type is required";
        if (!form.client_id) errs.client_id = "Client is required";
        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        setError(null);
        try {
            const payload = {
                case_number: form.case_number,
                case_name: form.case_name,
                case_type: form.case_type,
                status: form.status,
                current_stage: form.current_stage,
                client_id: form.client_id,
                court: form.court || null,
                filing_date: filingDate ? filingDate.toISOString() : null,
                notes: form.notes || null,
            };
            const res = await fetch(`${API_BASE}/cases/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.status === 201 || data.id) {
                setSuccess(true);
                setTimeout(() => navigate("/cases"), 1200);
            } else if (res.status === 409) {
                setError(`Case number "${form.case_number}" already exists.`);
            } else {
                setError(data.detail || data.error || "Failed to create case.");
            }
        } catch (err) {
            setError("Could not connect to server.");
        }
        setLoading(false);
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    if (!session) return null;

    return (
        <div className="dash-layout">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(v => !v)} session={session} />

            <main className="dash-main">
                <header className="dash-topbar">
                    <div className="topbar-left">
                        <h1 className="topbar-title">Add New Case</h1>
                        <span className="topbar-subtitle">Fill in the details to create a new legal matter</span>
                    </div>
                    <div className="topbar-right">
                        <div className="topbar-avatar">{getInitials(session.name)}</div>
                    </div>
                </header>

                <div className="addcase-content">
                    <div className="addcase-card">

                        {error && <div className="addcase-error">⚠ {error}</div>}
                        {success && <div className="addcase-success">✓ Case created! Redirecting...</div>}

                        <div className="addcase-grid">

                            <div className="addcase-field">
                                <label>Case Number <span className="required">*</span></label>
                                <input type="text" placeholder="e.g. 2024-CR-001" value={form.case_number} onChange={setField("case_number")} className={errors.case_number ? "field-error" : ""} />
                                {errors.case_number && <span className="field-error-msg">⚠ {errors.case_number}</span>}
                            </div>

                            <div className="addcase-field">
                                <label>Case Name <span className="required">*</span></label>
                                <input type="text" placeholder="e.g. State vs. John Doe" value={form.case_name} onChange={setField("case_name")} className={errors.case_name ? "field-error" : ""} />
                                {errors.case_name && <span className="field-error-msg">⚠ {errors.case_name}</span>}
                            </div>

                            <div className="addcase-field">
                                <label>Case Type <span className="required">*</span></label>
                                <select value={form.case_type} onChange={setField("case_type")} className={errors.case_type ? "field-error" : ""}>
                                    <option value="">Select case type</option>
                                    {CASE_TYPES.map((t) => (
                                        <option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                                    ))}
                                </select>
                                {errors.case_type && <span className="field-error-msg">⚠ {errors.case_type}</span>}
                            </div>

                            <div className="addcase-field">
                                <label>Client <span className="required">*</span></label>
                                <select value={form.client_id} onChange={setField("client_id")} className={errors.client_id ? "field-error" : ""}>
                                    <option value="">Select client</option>
                                    {clients.map((cl) => (
                                        <option key={cl.id} value={cl.id}>{cl.name}</option>
                                    ))}
                                </select>
                                {errors.client_id && <span className="field-error-msg">⚠ {errors.client_id}</span>}
                            </div>

                            <div className="addcase-field">
                                <label>Status</label>
                                <select value={form.status} onChange={setField("status")}>
                                    {CASE_STATUSES.map((s) => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="addcase-field">
                                <label>Current Stage</label>
                                <select value={form.current_stage} onChange={setField("current_stage")}>
                                    {CASE_STAGES.map((s) => (
                                        <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="addcase-field">
                                <label>Court</label>
                                <input type="text" placeholder="e.g. Ahmedabad Sessions Court" value={form.court} onChange={setField("court")} />
                            </div>

                            {/* ── Flatpickr Date Picker ── */}
                            <div className="addcase-field">
                                <label>Filing Date</label>
                                <div className="fp-input-wrap">
                                    <input
                                        ref={dateInputRef}
                                        type="text"
                                        placeholder="Select filing date"
                                        value={dateDisplay}
                                        readOnly
                                        className="fp-input"
                                    />
                                    <span className="fp-icon"><CalendarIcon /></span>
                                </div>
                            </div>

                        </div>

                        <div className="addcase-field addcase-notes">
                            <label>Notes</label>
                            <textarea placeholder="Any additional notes about the case..." value={form.notes} onChange={setField("notes")} rows={4} />
                        </div>

                        <div className="addcase-actions">
                            <button className="btn-cancel" onClick={() => navigate("/cases")}>Cancel</button>
                            <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
                                {loading ? <><span className="btn-spinner" /> Creating...</> : "Create Case"}
                            </button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}