import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./casedetail.css";

const API_BASE = "http://localhost:8000";

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

    const session = JSON.parse(localStorage.getItem("trialdesk_session") || "null");
    const token = session?.token;

    useEffect(() => {
        if (!session) navigate("/", { replace: true });
    }, [session, navigate]);

    // ── Fetch case with hearings and documents in one call ──
    useEffect(() => {
        const fetchAll = async () => {
            setPageLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE}/cases/get/${id}`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });
                const json = await res.json();

                if (res.status === 404) {
                    setError("Case not found.");
                    setPageLoading(false);
                    return;
                }

                setCaseData(json);
                setHearings(json.hearings || []);
                setDocs(json.documents || []);

                // Fetch client name
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

        if (token && id) fetchAll();
    }, [id, token]);

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
            <main className="dash-main">
                <div className="no-case">Loading case details...</div>
            </main>
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

                    {/* Breadcrumb */}
                    <div className="breadcrumb">
                        <span className="breadcrumb-back" onClick={() => navigate("/cases")}>← Cases</span>
                        <span className="breadcrumb-sep">/</span>
                        <span className="breadcrumb-title">{caseData.case_name}</span>
                        <StatusBadge status={caseData.status} />
                    </div>

                    {/* Info Cards + AI Button */}
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
                        <button
                            className="btn btn-primary"
                            onClick={handleSummarize}
                            disabled={loadingSummary}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            {loadingSummary ? "⏳ Summarizing..." : "🤖 AI Summary"}
                        </button>
                    </div>

                    {/* AI Summary */}
                    {aiSummary && (
                        <div className="ai-summary-box">
                            <div className="ai-summary-label">🤖 AI GENERATED SUMMARY</div>
                            <div className="ai-summary-text">{aiSummary}</div>
                            <div className="ai-summary-note">⚠️ AI-generated draft — verify before use.</div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="tabs">
                        {["overview", "hearings", "documents"].map(t => (
                            <div key={t} className={`tab ${tab === t ? "tab-active" : ""}`} onClick={() => setTab(t)}>{t}</div>
                        ))}
                    </div>

                    {/* Overview */}
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

                    {/* Hearings */}
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

                    {/* Documents */}
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
                                            onClick={() => window.open(`${API_BASE}/docs/download/${d.doc_id}`, "_blank")}
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
        </div>
    );
}