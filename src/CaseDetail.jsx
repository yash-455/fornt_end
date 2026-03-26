import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import Sidebar from "./components/Sidebar";
import "./css/casedetail.css";

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

const StatusBadge = ({ status }) => {
    const map = {
        open: { color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.3)" },
        pending: { color: "#facc15", bg: "rgba(250,204,21,0.1)", border: "rgba(250,204,21,0.3)" },
        closed: { color: "#888888", bg: "rgba(136,136,136,0.1)", border: "rgba(136,136,136,0.3)" },
    };
    const s = map[status?.toLowerCase()] || map.closed;
    return (
        <span className="status-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
            {status}
        </span>
    );
};

const Card = ({ children, style = {} }) => <div className="card" style={style}>{children}</div>;
const Label = ({ children }) => <div className="label">{children}</div>;
const Empty = ({ msg }) => <div className="empty"><div className="empty-icon">📭</div>{msg}</div>;

export default function CaseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [tab, setTab] = useState("overview");

    const [caseData, setCaseData] = useState(null);
    const [hearings, setHearings] = useState([]);
    const [docs, setDocs] = useState([]);
    const [clientName, setClientName] = useState("—");
    const [aiSummary, setAiSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Edit Modal State ──
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        case_name: "",
        status: "open",
        current_stage: "filing",
        court: "",
        filing_date: "",
        notes: "",
    });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState(null);
    const [editSuccess, setEditSuccess] = useState(false);
    const [dateDisplay, setDateDisplay] = useState("");
    const dateInputRef = useRef(null);
    const fpInstance = useRef(null);

    const session = JSON.parse(localStorage.getItem("trialdesk_session") || "null");
    const token = session?.token;

    useEffect(() => {
        if (!session) navigate("/", { replace: true });
    }, [session, navigate]);

    // ── Fetch case ──
    const fetchAll = async () => {
        setPageLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/cases/get/${id}`, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const json = await res.json();

            if (res.status === 404) { setError("Case not found."); setPageLoading(false); return; }

            setCaseData(json);
            setHearings(json.hearings || []);
            setDocs(json.documents || []);

            setEditForm({
                case_name: json.case_name || "",
                status: json.status || "open",
                current_stage: json.current_stage || "filing",
                court: json.court || "",
                filing_date: json.filing_date || "",
                notes: json.notes || "",
            });

            if (json.filing_date) {
                setDateDisplay(new Date(json.filing_date).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric"
                }));
            }

            if (json.client_id) {
                const clientRes = await fetch(`${API_BASE}/clients/get/${json.client_id}`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });
                const clientJson = await clientRes.json();
                if (clientJson.name) setClientName(clientJson.name);
            }

        } catch (err) {
            setError("Could not connect to server.");
        }
        setPageLoading(false);
    };

    useEffect(() => {
        if (token && id) fetchAll();
    }, [id, token]);

    // ── Init flatpickr when modal opens ──
    useEffect(() => {
        if (!showEditModal || !dateInputRef.current) return;

        fpInstance.current = flatpickr(dateInputRef.current, {
            dateFormat: "d M Y",
            disableMobile: true,
            defaultDate: editForm.filing_date ? new Date(editForm.filing_date) : undefined,
            onChange: (selectedDates, dateStr) => {
                setEditForm((p) => ({ ...p, filing_date: selectedDates[0] ? selectedDates[0].toISOString() : "" }));
                setDateDisplay(dateStr);
            },
        });

        return () => {
            if (fpInstance.current) fpInstance.current.destroy();
        };
    }, [showEditModal]);

    // ── AI Summary ──
    const handleSummarize = async () => {
        setLoadingSummary(true);
        try {
            const res = await fetch(`${API_BASE}/query/summary/${id}`, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const data = await res.json();
            setAiSummary(data.ai_summary || "No summary available.");
        } catch {
            setAiSummary("Failed to generate summary.");
        }
        setLoadingSummary(false);
    };

    const handleDownloadDoc = async (doc) => {
        const docId = doc?.doc_id;
        if (!docId) return;

        try {
            const res = await fetch(`${API_BASE}/docs/download/${docId}`, {
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Download failed");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = doc.filename || `document-${docId}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            setError("Unable to download document.");
        }
    };

    // ── Edit Submit ──
    const handleEditSubmit = async () => {
        setEditLoading(true);
        setEditError(null);
        try {
            const payload = {
                case_name: editForm.case_name,
                status: editForm.status,
                current_stage: editForm.current_stage,
                court: editForm.court || null,
                filing_date: editForm.filing_date ? new Date(editForm.filing_date).toISOString() : null,
                notes: editForm.notes || null,
            };

            const res = await fetch(`${API_BASE}/cases/update/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok || data.message === "Case updated successfully.") {
                setEditSuccess(true);
                setTimeout(() => {
                    setShowEditModal(false);
                    setEditSuccess(false);
                    fetchAll();
                }, 1000);
            } else {
                setEditError(data.detail || data.error || "Failed to update case.");
            }
        } catch {
            setEditError("Could not connect to server.");
        }
        setEditLoading(false);
    };

    const setEditField = (key) => (e) => {
        setEditForm((p) => ({ ...p, [key]: e.target.value }));
        setEditError(null);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        try {
            return new Date(dateStr).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric"
            });
        } catch { return dateStr; }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    if (!session) return null;

    if (pageLoading) return (
        <div className="dash-layout">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(v => !v)} session={session} />
            <main className="dash-main"><div className="no-case">Loading case details...</div></main>
        </div>
    );

    if (error) return (
        <div className="dash-layout">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(v => !v)} session={session} />
            <main className="dash-main">
                <div className="no-case">{error} <span className="back-link" onClick={() => navigate("/cases")}>← Go to Cases</span></div>
            </main>
        </div>
    );

    return (
        <div className="dash-layout">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(v => !v)} session={session} />

            <main className="dash-main">
                <header className="dash-topbar">
                    <div className="topbar-left">
                        <h1 className="topbar-title">Case Detail</h1>
                        <span className="topbar-subtitle">Full details of the selected legal matter</span>
                    </div>
                    <div className="topbar-right">
                        <div className="topbar-avatar">{getInitials(session.name)}</div>
                    </div>
                </header>

                <div style={{ padding: "24px 32px" }} className="fade-in">

                    <div className="breadcrumb">
                        <span className="breadcrumb-back" onClick={() => navigate("/cases")}>← Cases</span>
                        <span className="breadcrumb-sep">/</span>
                        <span className="breadcrumb-title">{caseData.case_name}</span>
                        <StatusBadge status={caseData.status} />
                    </div>

                    <div className="detail-top">
                        <div className="info-cards">
                            {[
                                ["Case Number", caseData.case_number],
                                ["Client", clientName],
                                ["Court", caseData.court || "—"],
                                ["Filed", formatDate(caseData.filing_date)],
                            ].map(([k, v]) => (
                                <Card key={k} style={{ padding: "0.75rem 1rem" }}>
                                    <Label>{k}</Label>
                                    <div className="info-value" style={{ fontFamily: k === "Case Number" ? "'DM Mono',monospace" : "inherit" }}>{v}</div>
                                </Card>
                            ))}
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button className="btn btn-outline" onClick={() => setShowEditModal(true)} style={{ whiteSpace: "nowrap" }}>
                                ✏️ Edit Case
                            </button>
                            <button className="btn btn-primary" onClick={handleSummarize} disabled={loadingSummary} style={{ whiteSpace: "nowrap" }}>
                                {loadingSummary ? "⏳ Summarizing..." : "🤖 AI Summary"}
                            </button>
                        </div>
                    </div>

                    {aiSummary && (
                        <div className="ai-summary-box">
                            <div className="ai-summary-label">🤖 AI GENERATED SUMMARY</div>
                            <div className="ai-summary-text">{aiSummary}</div>
                            <div className="ai-summary-note">⚠️ AI-generated draft — verify before use.</div>
                        </div>
                    )}

                    <div className="tabs">
                        {["overview", "hearings", "documents"].map(t => (
                            <div key={t} className={`tab ${tab === t ? "tab-active" : ""}`} onClick={() => setTab(t)}>{t}</div>
                        ))}
                    </div>

                    {tab === "overview" && (
                        <Card>
                            <Label>Case Type</Label>
                            <div className="notes-text" style={{ marginBottom: 12 }}>
                                {caseData.case_type?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "—"}
                            </div>
                            <Label>Current Stage</Label>
                            <div className="notes-text" style={{ marginBottom: 12 }}>
                                {caseData.current_stage?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "—"}
                            </div>
                            <Label>Case Notes</Label>
                            <div className="notes-text">{caseData.notes || "No notes added."}</div>
                        </Card>
                    )}

                    {tab === "hearings" && (
                        <div>
                            {hearings.length === 0 ? <Empty msg="No hearings recorded" /> : hearings.map(h => (
                                <Card key={h.id} style={{ marginBottom: 10 }}>
                                    <div className="hearing-header">
                                        <div className="hearing-date-mono">{formatDate(h.date)}</div>
                                        <StatusBadge status={
                                            h.outcome?.toLowerCase().includes("decided") ? "closed" :
                                            h.outcome?.toLowerCase().includes("pending") ? "pending" : "open"
                                        } />
                                    </div>
                                    <div className="hearing-grid">
                                        <div><Label>Judge</Label><div className="hearing-text">{h.judge || "—"}</div></div>
                                        <div><Label>Next Date</Label><div className="hearing-next">{formatDate(h.next_date)}</div></div>
                                    </div>
                                    <div style={{ marginTop: 8 }}>
                                        <Label>Outcome & Notes</Label>
                                        <div className="hearing-notes">{h.outcome} {h.notes ? `— ${h.notes}` : ""}</div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {tab === "documents" && (
                        <div>
                            {docs.length === 0 ? <Empty msg="No documents uploaded" /> : docs.map(d => (
                                <Card key={d.id} style={{ marginBottom: 10 }}>
                                    <div className="doc-row">
                                        <div className="doc-left">
                                            <span className="doc-icon">📕</span>
                                            <div>
                                                <div className="doc-name">{d.filename}</div>
                                                <div className="doc-date">Uploaded: {formatDate(d.uploaded_at)}</div>
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-outline"
                                            style={{ fontSize: 11 }}
                                            onClick={() => handleDownloadDoc(d)}
                                        >
                                            Download
                                        </button>
                                    </div>
                                    {d.description && (
                                        <div style={{ marginTop: 8 }}>
                                            <Label>Description</Label>
                                            <div className="hearing-notes">{d.description}</div>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}

                </div>
            </main>

            {/* ── Edit Modal ── */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="edit-modal-card" onClick={(e) => e.stopPropagation()}>

                        <div className="edit-modal-header">
                            <div className="edit-modal-title">Edit Case</div>
                            <button className="edit-modal-close" onClick={() => setShowEditModal(false)}>✕</button>
                        </div>

                        {editError && <div className="edit-modal-error">⚠ {editError}</div>}
                        {editSuccess && <div className="edit-modal-success">✓ Case updated successfully!</div>}

                        <div className="edit-modal-grid">

                            <div className="edit-modal-field">
                                <label>Case Name</label>
                                <input type="text" value={editForm.case_name} onChange={setEditField("case_name")} placeholder="e.g. State vs. John Doe" />
                            </div>

                            <div className="edit-modal-field">
                                <label>Court</label>
                                <input type="text" value={editForm.court} onChange={setEditField("court")} placeholder="e.g. Ahmedabad Sessions Court" />
                            </div>

                            <div className="edit-modal-field">
                                <label>Status</label>
                                <select value={editForm.status} onChange={setEditField("status")}>
                                    {CASE_STATUSES.map((s) => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="edit-modal-field">
                                <label>Current Stage</label>
                                <select value={editForm.current_stage} onChange={setEditField("current_stage")}>
                                    {CASE_STAGES.map((s) => (
                                        <option key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                                    ))}
                                </select>
                            </div>

                            {/* ── Flatpickr Date Picker ── */}
                            <div className="edit-modal-field">
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

                        <div className="edit-modal-field" style={{ marginTop: 4 }}>
                            <label>Notes</label>
                            <textarea value={editForm.notes} onChange={setEditField("notes")} placeholder="Any additional notes..." rows={3} />
                        </div>

                        <div className="edit-modal-actions">
                            <button className="btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button className="btn-submit" onClick={handleEditSubmit} disabled={editLoading}>
                                {editLoading ? <><span className="btn-spinner" /> Updating...</> : "Update Case"}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}