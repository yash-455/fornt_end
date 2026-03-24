import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import Sidebar from "./components/Sidebar";
import "./editcase.css";

const API_BASE = "http://localhost:8000";

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

export default function EditCase() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [filingDate, setFilingDate] = useState(null);
    const [dateDisplay, setDateDisplay] = useState("");
    const dateInputRef = useRef(null);
    const fpInstance = useRef(null);

    const session = JSON.parse(localStorage.getItem("trialdesk_session") || "null");
    const token = session?.token;

    const [form, setForm] = useState({
        case_name: "",
        status: "open",
        current_stage: "filing",
        court: "",
        notes: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!session) navigate("/", { replace: true });
    }, [session, navigate]);

    useEffect(() => {
        const fetchCase = async () => {
            setFetching(true);
            try {
                const res = await fetch(`${API_BASE}/cases/get/${id}`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });
                const data = await res.json();
                if (res.status === 404) { setError("Case not found."); setFetching(false); return; }
                setForm({
                    case_name: data.case_name || "",
                    status: data.status || "open",
                    current_stage: data.current_stage || "filing",
                    court: data.court || "",
                    notes: data.notes || "",
                });
                if (data.filing_date) {
                    const d = new Date(data.filing_date);
                    setFilingDate(d);
                    setDateDisplay(d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }));
                }
            } catch (_) {
                setError("Could not connect to server.");
            }
            setFetching(false);
        };
        if (token && id) fetchCase();
    }, [id, token]);

    // ── Init flatpickr after fetching is done ──
    useEffect(() => {
        if (fetching || !dateInputRef.current) return;

        fpInstance.current = flatpickr(dateInputRef.current, {
            dateFormat: "d M Y",
            disableMobile: true,
            defaultDate: filingDate || undefined,
            onChange: (selectedDates, dateStr) => {
                setFilingDate(selectedDates[0] || null);
                setDateDisplay(dateStr);
            },
        });

        return () => {
            if (fpInstance.current) fpInstance.current.destroy();
        };
    }, [fetching]);

    const setField = (key) => (e) => {
        setForm((p) => ({ ...p, [key]: e.target.value }));
        setErrors((p) => ({ ...p, [key]: undefined }));
        setError(null);
    };

    const validate = () => {
        const errs = {};
        if (!form.case_name.trim()) errs.case_name = "Case name is required";
        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        setError(null);
        try {
            const payload = {
                case_name: form.case_name,
                status: form.status,
                current_stage: form.current_stage,
                court: form.court || null,
                filing_date: filingDate ? filingDate.toISOString() : null,
                notes: form.notes || null,
            };
            const res = await fetch(`${API_BASE}/cases/update/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok || data.message === "Case updated successfully.") {
                setSuccess(true);
                setTimeout(() => navigate("/cases"), 1200);
            } else {
                setError(data.detail || data.error || "Failed to update case.");
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

    if (fetching) return (
        <div className="dash-layout">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(v => !v)} session={session} />
            <main className="dash-main"><div className="editcase-loading">Loading case details...</div></main>
        </div>
    );

    return (
        <div className="dash-layout">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(v => !v)} session={session} />

            <main className="dash-main">
                <header className="dash-topbar">
                    <div className="topbar-left">
                        <h1 className="topbar-title">Update Case</h1>
                        <span className="topbar-subtitle">Edit the details of the selected legal matter</span>
                    </div>
                    <div className="topbar-right">
                        <div className="topbar-avatar">{getInitials(session.name)}</div>
                    </div>
                </header>

                <div className="editcase-content">
                    <div className="editcase-card">

                        {error && <div className="editcase-error">⚠ {error}</div>}
                        {success && <div className="editcase-success">✓ Case updated! Redirecting...</div>}

                        <div className="editcase-grid">

                            <div className="editcase-field">
                                <label>Case Name <span className="required">*</span></label>
                                <input type="text" placeholder="e.g. State vs. John Doe" value={form.case_name} onChange={setField("case_name")} className={errors.case_name ? "field-error" : ""} />
                                {errors.case_name && <span className="field-error-msg">⚠ {errors.case_name}</span>}
                            </div>

                            <div className="editcase-field">
                                <label>Court</label>
                                <input type="text" placeholder="e.g. Ahmedabad Sessions Court" value={form.court} onChange={setField("court")} />
                            </div>

                            <div className="editcase-field">
                                <label>Status</label>
                                <select value={form.status} onChange={setField("status")}>
                                    {CASE_STATUSES.map((s) => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="editcase-field">
                                <label>Current Stage</label>
                                <select value={form.current_stage} onChange={setField("current_stage")}>
                                    {CASE_STAGES.map((s) => (
                                        <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                                    ))}
                                </select>
                            </div>

                            {/* ── Flatpickr Date Picker ── */}
                            <div className="editcase-field">
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

                        <div className="editcase-field editcase-notes">
                            <label>Notes</label>
                            <textarea placeholder="Any additional notes about the case..." value={form.notes} onChange={setField("notes")} rows={4} />
                        </div>

                        <div className="editcase-actions">
                            <button className="btn-cancel" onClick={() => navigate("/cases")}>Cancel</button>
                            <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
                                {loading ? <><span className="btn-spinner" /> Updating...</> : "Update Case"}
                            </button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}