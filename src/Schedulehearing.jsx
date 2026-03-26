import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import Sidebar from "./components/Sidebar";
import "./css/Schedulehearing.css";

const API_BASE = "http://localhost:8000";

const OUTCOMES = ["Adjourned", "Pending", "Arguments heard", "Decided — Plaintiff", "Decided — Defendant", "Settled", "Dismissed"];

const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
);

export default function ScheduleHearing() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [lastHearingDate, setLastHearingDate] = useState(null);
    const [nextTime, setNextTime] = useState("10:00");


    const nextDateRef = useRef(null);
    const fpNextDate = useRef(null);
    const [nextDateVal, setNextDateVal] = useState(null);
    const [nextDateDisplay, setNextDateDisplay] = useState("");

    const session = JSON.parse(localStorage.getItem("trialdesk_session") || "null");
    const token = session?.token;

    const [form, setForm] = useState({
        case_id: "",
        judge: "",
        outcome: "",
        notes: "",
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (!session) navigate("/", { replace: true });
    }, [session, navigate]);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const res = await fetch(`${API_BASE}/cases/get_all`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });
                const data = await res.json();
                if (Array.isArray(data)) setCases(data);
            } catch (_) {}
        };
        if (token) fetchCases();
    }, [token]);

    useEffect(() => {
        if (nextDateRef.current) {
            fpNextDate.current = flatpickr(nextDateRef.current, {
                dateFormat: "d M Y",
                disableMobile: true,
                onChange: (dates, str) => { setNextDateVal(dates[0] || null); setNextDateDisplay(str); },
            });
        }
        return () => { if (fpNextDate.current) fpNextDate.current.destroy(); };
    }, []);

    useEffect(() => {
        if (!form.case_id) {
            setLastHearingDate(null);
            setForm(p => ({ ...p, judge: "" }));
            return;
        }
        const fetchLastHearing = async () => {
            try {
                const res = await fetch(`${API_BASE}/hearings/get?case_id=${form.case_id}`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    const sorted = [...data]
                        .filter(h => h.next_date)
                        .sort((a, b) => new Date(b.next_date) - new Date(a.next_date));
                    const last = sorted[0];
                    setLastHearingDate(last ? last.next_date : null);
                    if (last?.judge) setForm(p => ({ ...p, judge: last.judge }));
                } else {
                    setLastHearingDate(null);
                    setForm(p => ({ ...p, judge: "" }));
                }
            } catch (_) { setLastHearingDate(null); }
        };
        fetchLastHearing();
    }, [form.case_id, token]);

    const setField = (key) => (e) => {
        setForm((p) => ({ ...p, [key]: e.target.value }));
        setFormErrors((p) => ({ ...p, [key]: undefined }));
        setError(null);
    };

    const validate = () => {
        const errs = {};
        if (!form.case_id) errs.case_id = "Case is required";
        if (!form.outcome) errs.outcome = "Outcome is required";
        if (!nextDateVal) errs.next_date = "Next date is required";
        return errs;
    };

    const combineDateTime = (date, time) => {
        if (!date || !time) return null;
        const [hours, minutes] = time.split(":").map(Number);
        const d = new Date(date);
        d.setHours(hours, minutes, 0, 0);
        return d.toISOString();
    };
    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setFormErrors(errs); return; }
        setLoading(true);
        setError(null);
        try {
            const payload = {
                case_id: form.case_id,
                judge: form.judge || null,
                outcome: form.outcome,
                date: lastHearingDate ? new Date(lastHearingDate).toISOString() : null,
                next_date: combineDateTime(nextDateVal, nextTime),
                notes: form.notes || null,
            };
            const res = await fetch(`${API_BASE}/hearings/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.status === 201 || data.id) {
                setSuccess(true);
                setTimeout(() => navigate("/hearings"), 1200);
            } else {
                setError(data.detail || data.error || "Failed to schedule hearing.");
            }
        } catch (_) {
            setError("Could not connect to server.");
        }
        setLoading(false);
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    };

    if (!session) return null;

    return (
        <div className="dash-layout">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(v => !v)} session={session} />

            <main className="dash-main">
                <header className="dash-topbar">
                    <div className="topbar-left">
                        <h1 className="topbar-title">Schedule Hearing</h1>
                        <span className="topbar-subtitle">Add a new court hearing for a case</span>
                    </div>
                    <div className="topbar-right">
                        <div className="topbar-avatar">{getInitials(session.name)}</div>
                    </div>
                </header>

                <div className="sh-content">
                    <div className="sh-card">

                        {error && <div className="sh-error">⚠ {error}</div>}
                        {success && <div className="sh-success">✓ Hearing scheduled! Redirecting...</div>}

                        <div className="sh-grid">

                            <div className="sh-field">
                                <label>Case <span className="required">*</span></label>
                                <select value={form.case_id} onChange={setField("case_id")} className={formErrors.case_id ? "field-error" : ""}>
                                    <option value="">Select case</option>
                                    {cases.map((c) => (
                                        <option key={c.id} value={c.id}>{c.case_number} — {c.case_name}</option>
                                    ))}
                                </select>
                                {formErrors.case_id && <span className="field-error-msg">⚠ {formErrors.case_id}</span>}
                            </div>

                            <div className="sh-field">
                                <label>
                                    Judge
                                    {lastHearingDate && form.judge && (
                                        <span className="sh-hint"> (from last hearing)</span>
                                    )}
                                </label>
                                <input type="text" placeholder="e.g. Justice Mehta" value={form.judge} onChange={setField("judge")} />
                            </div>

                            <div className="sh-field">
                                <label>Outcome <span className="required">*</span></label>
                                <select value={form.outcome} onChange={setField("outcome")} className={formErrors.outcome ? "field-error" : ""}>
                                    <option value="">Select outcome</option>
                                    {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                                {formErrors.outcome && <span className="field-error-msg">⚠ {formErrors.outcome}</span>}
                            </div>

                            <div className="sh-field">
                                <label>Last Hearing Date</label>
                                <div className={`sh-last-date-box ${!lastHearingDate ? "sh-no-hearing" : ""}`}>
                                    {lastHearingDate ? formatDate(lastHearingDate) : "No previous hearing"}
                                </div>
                            </div>

                            <div className="sh-field">
                                <label>Next Date <span className="required">*</span></label>
                                <div className="fp-input-wrap">
                                    <input
                                        ref={nextDateRef}
                                        type="text"
                                        placeholder="Select next date"
                                        value={nextDateDisplay}
                                        readOnly
                                        className={`fp-input ${formErrors.next_date ? "field-error" : ""}`}
                                    />
                                    <span className="fp-icon"><CalendarIcon /></span>
                                </div>
                                {formErrors.next_date && <span className="field-error-msg">⚠ {formErrors.next_date}</span>}
                            </div>

                            <div className="sh-field">
                                <label>Time <span className="required">*</span></label>
                                <input
                                    type="time"
                                    value={nextTime}
                                    onChange={(e) => setNextTime(e.target.value)}
                                    className="sh-time-input"
                                />
                            </div>

                        </div>

                        <div className="sh-field sh-notes">
                            <label>Notes</label>
                            <textarea placeholder="Any additional notes about the hearing..." value={form.notes} onChange={setField("notes")} rows={4} />
                        </div>

                        <div className="sh-actions">
                            <button className="btn-cancel" onClick={() => navigate("/hearings")}>Cancel</button>
                            <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
                                {loading ? <><span className="btn-spinner" /> Scheduling...</> : "Schedule Hearing"}
                            </button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}