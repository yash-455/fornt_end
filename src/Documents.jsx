import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./document.css";

const API_BASE = "http://localhost:8000";

const IconSearch = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const IconFilter = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

const IconPlus = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const IconDownload = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

export default function Documents() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCase, setSelectedCase] = useState("All");
    const [cases, setCases] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [summaryByDocId, setSummaryByDocId] = useState({});
    const [summaryLoadingId, setSummaryLoadingId] = useState(null);

    const session = JSON.parse(localStorage.getItem("trialdesk_session") || "null");
    const token = session?.token;

    useEffect(() => {
        if (!session) navigate("/", { replace: true });
    }, [session, navigate]);

    useEffect(() => {
        const fetchDocuments = async () => {
            setLoading(true);
            setError(null);
            try {
                const casesRes = await fetch(`${API_BASE}/cases/get_all`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const casesJson = await casesRes.json();
                const allCases = Array.isArray(casesJson) ? casesJson : [];
                setCases(allCases);

                const caseDetailResponses = await Promise.all(
                    allCases.map(async (c) => {
                        try {
                            const res = await fetch(`${API_BASE}/cases/get/${c.id}`, {
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            if (!res.ok) return null;
                            return await res.json();
                        } catch {
                            return null;
                        }
                    })
                );

                const flattenedDocs = [];
                caseDetailResponses.forEach((detail) => {
                    if (!detail || !Array.isArray(detail.documents)) return;
                    detail.documents.forEach((doc, idx) => {
                        flattenedDocs.push({
                            row_id: doc.doc_id || doc.id || `${detail.id || detail.case_id}-${idx}`,
                            doc_id: doc.doc_id || doc.id,
                            filename: doc.filename || doc.name || "Untitled document",
                            uploaded_at: doc.uploaded_at || null,
                            description: doc.description || "",
                            case_id: detail.id || detail.case_id,
                            case_number: detail.case_number || "—",
                            case_name: detail.case_name || "—",
                        });
                    });
                });

                setDocuments(flattenedDocs);
            } catch {
                setError("Could not load documents.");
                setDocuments([]);
            }
            setLoading(false);
        };

        if (token) fetchDocuments();
    }, [token]);

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

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        try {
            return new Date(dateStr).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            return "—";
        }
    };

    const filteredDocuments = useMemo(() => {
        return documents.filter((d) => {
            const matchSearch =
                !searchQuery ||
                d.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.filename.toLowerCase().includes(searchQuery.toLowerCase());

            const matchCase = selectedCase === "All" || String(d.case_id) === String(selectedCase);
            return matchSearch && matchCase;
        });
    }, [documents, searchQuery, selectedCase]);

    const handleDownload = async (doc) => {
        if (!doc?.doc_id) return;

        try {
            const res = await fetch(`${API_BASE}/docs/download/${doc.doc_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                let detail = "Download failed.";
                try {
                    const data = await res.json();
                    detail = data?.detail || data?.error || detail;
                } catch {
                    // ignore parse errors and keep fallback detail
                }
                throw new Error(detail);
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = doc.filename || `document-${doc.doc_id}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            setError(e?.message || "Unable to download document. Please try again.");
        }
    };

    const handleSummarize = async (doc) => {
        if (!doc?.doc_id) {
            setSummaryByDocId((p) => ({
                ...p,
                [doc.row_id]: "Unable to summarize because this document has no doc_id.",
            }));
            return;
        }

        setSummaryLoadingId(doc.row_id);

        try {
            const endpoints = [
                `${API_BASE}/query/summary/doc/${doc.doc_id}`,
                `${API_BASE}/query/doc-summary/${doc.doc_id}`,
                `${API_BASE}/query/summary/${doc.case_id}?doc_id=${doc.doc_id}`,
                `${API_BASE}/query/summary/${doc.case_id}`,
            ];

            let summaryText = null;

            for (const url of endpoints) {
                try {
                    const res = await fetch(url, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) continue;
                    const data = await res.json();
                    summaryText = data.ai_summary || data.summary || data.message || null;
                    if (summaryText) break;
                } catch {
                    // Continue to fallback endpoint
                }
            }

            setSummaryByDocId((p) => ({
                ...p,
                [doc.row_id]: summaryText || "No summary available for this document.",
            }));
        } catch {
            setSummaryByDocId((p) => ({
                ...p,
                [doc.row_id]: "Failed to generate summary.",
            }));
        }

        setSummaryLoadingId(null);
    };

    return (
        <div className="dash-layout">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen((v) => !v)} session={session} />

            <main className="dash-main">
                <header className="dash-topbar">
                    <div className="topbar-left">
                        <h1 className="topbar-title">Documents</h1>
                        <span className="topbar-subtitle">Search, filter, download, and summarize case documents</span>
                    </div>
                    <div className="topbar-right">
                        <div className="topbar-avatar">{getInitials(session.name)}</div>
                    </div>
                </header>

                <div className="documents-content">
                    <div className="documents-toolbar">
                        <div className="toolbar-left">
                            <div className="search-bar docs-search">
                                <span className="search-icon">
                                    <IconSearch />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search by case ID or document name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="filter-group docs-filter">
                                <span className="filter-icon">
                                    <IconFilter />
                                </span>
                                <select
                                    value={selectedCase}
                                    onChange={(e) => setSelectedCase(e.target.value)}
                                    className="status-select"
                                >
                                    <option value="All">All Cases</option>
                                    {cases.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.case_number}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button className="new-doc-btn" onClick={() => navigate("/documents/adddocument")}>
                            <IconPlus />
                            <span>Add Docs</span>
                        </button>
                    </div>

                    <div className="documents-table-card">
                        <div className="table-responsive">
                            <table className="documents-table">
                                <thead>
                                    <tr>
                                        <th>Case</th>
                                        <th>Document</th>
                                        <th>Uploaded</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="4" className="no-results">Loading documents...</td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan="4" className="no-results">{error}</td>
                                        </tr>
                                    ) : filteredDocuments.length > 0 ? (
                                        filteredDocuments.map((doc) => (
                                            <tr key={doc.row_id}>
                                                <td>
                                                    <div className="doc-case-number">{doc.case_number}</div>
                                                    <div className="doc-case-name">{doc.case_name}</div>
                                                </td>
                                                <td>
                                                    <div className="doc-file-name">{doc.filename}</div>
                                                    {doc.description ? (
                                                        <div className="doc-file-desc">{doc.description}</div>
                                                    ) : (
                                                        <div className="doc-file-desc">No description</div>
                                                    )}
                                                </td>
                                                <td>{formatDate(doc.uploaded_at)}</td>
                                                <td>
                                                    <div className="doc-actions">
                                                        <button className="doc-download-btn" onClick={() => handleDownload(doc)}>
                                                            <IconDownload />
                                                            <span>Download</span>
                                                        </button>
                                                        <button
                                                            className="doc-summary-btn"
                                                            onClick={() => handleSummarize(doc)}
                                                            disabled={summaryLoadingId === doc.row_id}
                                                        >
                                                            {summaryLoadingId === doc.row_id ? "Summarizing..." : "AI Summary"}
                                                        </button>
                                                    </div>
                                                    {summaryByDocId[doc.row_id] && (
                                                        <div className="doc-summary-text">{summaryByDocId[doc.row_id]}</div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="no-results">No documents found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
