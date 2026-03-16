import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { G, MOCK_HEARINGS, MOCK_DOCS, MOCK_CASES } from "./theme";
import "./casedetail.css";

const StatusBadge = ({ status }) => {
  const map = { open: [G.green, G.greenBg], pending: [G.amber, G.amberBg], closed: [G.muted, G.navy3] };
  const [fg, bg] = map[status] || [G.muted, G.navy3];
  return <span className="status-badge" style={{ background: bg, color: fg, border: `1px solid ${fg}` }}>{status}</span>;
};

const Card = ({ children, style = {} }) => <div className="card" style={style}>{children}</div>;
const Label = ({ children }) => <div className="label">{children}</div>;
const Btn = ({ children, variant = "primary", style = {}, ...p }) => (
  <button className={`btn btn-${variant}`} style={style} {...p}>{children}</button>
);
const Empty = ({ msg }) => <div className="empty"><div className="empty-icon">📭</div>{msg}</div>;

export default function CaseDetail({ caseData: propCaseData, setPage }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab,            setTab]            = useState("overview");
  const [showSummary,    setShowSummary]    = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // If caseData is not passed as a prop, find it in MOCK_CASES using id from URL
  const caseData = propCaseData || MOCK_CASES.find(c => c.id === id);

  if (!caseData) return (
    <div className="no-case">
      No case selected or case not found.{" "}
      <span className="back-link" onClick={() => navigate("/cases")}>← Go to Cases</span>
    </div>
  );

  const goBack = () => {
    if (setPage) setPage("cases");
    else navigate("/cases");
  };

  const hearings = MOCK_HEARINGS.filter(h => h.case_id === caseData.id);
  const docs     = MOCK_DOCS.filter(d => d.case_id === caseData.id);

  const handleSummarize = () => {
    setLoadingSummary(true);
    setTimeout(() => { setLoadingSummary(false); setShowSummary(true); }, 1500);
  };

  return (
    <div className="fade-in">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-back" onClick={goBack}>← Cases</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-title">{caseData.case_name}</span>
        <StatusBadge status={caseData.status} />
      </div>

      {/* Info + AI Button */}
      <div className="detail-top">
        <div className="info-cards">
          {[["Case Number", caseData.case_number], ["Client", caseData.client_name], ["Court", caseData.court], ["Filed", caseData.filing_date]].map(([k, v]) => (
            <Card key={k} style={{ padding: "0.75rem 1rem" }}>
              <Label>{k}</Label>
              <div className="info-value" style={{ fontFamily: k === "Case Number" ? "'DM Mono',monospace" : "inherit" }}>{v}</div>
            </Card>
          ))}
        </div>
        <Btn onClick={handleSummarize} style={{ whiteSpace: "nowrap" }}>
          {loadingSummary ? "⏳ Summarizing..." : "🤖 AI Summary"}
        </Btn>
      </div>

      {/* AI Summary */}
      {showSummary && (
        <div className="ai-summary-box">
          <div className="ai-summary-label">🤖 AI GENERATED SUMMARY</div>
          <div className="ai-summary-text">{caseData.ai_summary}</div>
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
                <div className="hearing-date-mono">{h.date}</div>
                <StatusBadge status={h.outcome === "Adjourned" ? "pending" : h.outcome.includes("Decided") ? "closed" : "open"} />
              </div>
              <div className="hearing-grid">
                <div><Label>Judge</Label><div className="hearing-text">{h.judge}</div></div>
                <div><Label>Next Date</Label><div className="hearing-next">{h.next_date || "—"}</div></div>
              </div>
              <div style={{ marginTop: 8 }}>
                <Label>Outcome & Notes</Label>
                <div className="hearing-notes">{h.outcome} — {h.notes}</div>
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
                  <span className="doc-icon">{d.file_type === "pdf" ? "📕" : "📘"}</span>
                  <div>
                    <div className="doc-name">{d.name}</div>
                    <div className="doc-date">Uploaded: {d.uploaded_at}</div>
                  </div>
                </div>
                <Btn variant="outline" style={{ fontSize: 11 }}>View Summary</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
