import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./Adddocument.css";

const API_BASE = "http://localhost:8000";

// ── Icons ──
const IconUpload = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
);

const IconFile = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

const IconX = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const IconCheck = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default function AddDocument() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [cases, setCases] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const session = JSON.parse(localStorage.getItem("trialdesk_session") || "null");
    const token = session?.token;

    const [form, setForm] = useState({
        doc_id: "",
        case_id: "",
        client_id: "",
        description: "",
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (!session) navigate("/", { replace: true });
    }, [session, navigate]);

    // fetch cases
    useEffect(() => {
        const fetchCases = async () => {
            try {
                const res = await fetch(`${API_BASE}/cases/get_all`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (Array.isArray(data)) setCases(data);
            } catch (_) {}
        };
        if (token) fetchCases();
    }, [token]);

    // fetch clients
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await fetch(`${API_BASE}/clients/get_all`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (Array.isArray(data)) setClients(data);
            } catch (_) {}
        };
        if (token) fetchClients();
    }, [token]);

    // auto-fill client when case is selected
    useEffect(() => {
        if (!form.case_id) return;
        const selectedCase = cases.find((c) => c.id === form.case_id);
        if (selectedCase?.client_id) {
            setForm((p) => ({ ...p, client_id: selectedCase.client_id }));
        }
    }, [form.case_id, cases]);

    const setField = (key) => (e) => {
        setForm((p) => ({ ...p, [key]: e.target.value }));
        setFormErrors((p) => ({ ...p, [key]: undefined }));
        setError(null);
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleFileSelect = (file) => {
        if (!file.name.endsWith(".pdf")) {
            setError("Only PDF files are supported.");
            return;
        }
        setSelectedFile(file);
        setError(null);
        // auto-fill doc_id from filename
        if (!form.doc_id) {
            const base = file.name.replace(/\.pdf$/i, "").replace(/\s+/g, "-").toLowerCase();
            setForm((p) => ({ ...p, doc_id: base }));
        }
    };

    const handleInputChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFileSelect(file);
    };

    const validate = () => {
        const errs = {};
        if (!selectedFile) errs.file = "Please select a PDF file";
        if (!form.doc_id.trim()) errs.doc_id = "Document ID is required";
        if (!form.case_id) errs.case_id = "Case is required";
        if (!form.client_id) errs.client_id = "Client is required";
        return errs;
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setFormErrors(errs); return; }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("doc_id", form.doc_id);
            formData.append("case_id", form.case_id);
            formData.append("client_id", form.client_id);
            if (form.description) formData.append("description", form.description);

            const res = await fetch(`${API_BASE}/docs/upload`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();

            if (res.status === 201 || data.doc_id) {
                setSuccess(true);
                setTimeout(() => navigate("/documents"), 1400);
            } else if (res.status === 400) {
                setError(`A document with ID "${form.doc_id}" already exists. Please use a different ID.`);
            } else {
                setError(data.detail || data.error || "Failed to upload document.");
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

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    if (!session) return null;

    return (
        <div className="dash-layout">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen((v) => !v)} session={session} />

            <main className="dash-main">
                <header className="dash-topbar">
                    <div className="topbar-left">
                        <h1 className="topbar-title">Upload Document</h1>
                        <span className="topbar-subtitle">Attach a PDF to a case for AI-powered retrieval</span>
                    </div>
                    <div className="topbar-right">
                        <div className="topbar-avatar">{getInitials(session.name)}</div>
                    </div>
                </header>

                <div className="adddoc-content">
                    <div className="adddoc-card">

                        {error && <div className="adddoc-error">⚠ {error}</div>}
                        {success && (
                            <div className="adddoc-success">
                                <IconCheck />
                                Document uploaded successfully! Redirecting...
                            </div>
                        )}

                        {/* ── Drop Zone ── */}
                        <div
                            className={`adddoc-dropzone ${dragOver ? "drag-over" : ""} ${selectedFile ? "has-file" : ""}`}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleFileDrop}
                            onClick={() => !selectedFile && document.getElementById("adddoc-file-input").click()}
                        >
                            <input
                                id="adddoc-file-input"
                                type="file"
                                accept=".pdf"
                                style={{ display: "none" }}
                                onChange={handleInputChange}
                            />

                            {selectedFile ? (
                                <div className="adddoc-file-preview">
                                    <div className="adddoc-file-icon">
                                        <IconFile />
                                    </div>
                                    <div className="adddoc-file-info">
                                        <span className="adddoc-file-name">{selectedFile.name}</span>
                                        <span className="adddoc-file-size">{formatFileSize(selectedFile.size)}</span>
                                    </div>
                                    <button
                                        className="adddoc-file-remove"
                                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setForm((p) => ({ ...p, doc_id: "" })); }}
                                    >
                                        <IconX />
                                    </button>
                                </div>
                            ) : (
                                <div className="adddoc-dropzone-inner">
                                    <div className="adddoc-upload-icon">
                                        <IconUpload />
                                    </div>
                                    <div className="adddoc-drop-title">Drop your PDF here</div>
                                    <div className="adddoc-drop-subtitle">or <span className="adddoc-browse-link">browse files</span></div>
                                    <div className="adddoc-drop-hint">PDF only · max 20 MB</div>
                                </div>
                            )}
                        </div>
                        {formErrors.file && <span className="field-error-msg">⚠ {formErrors.file}</span>}

                        {/* ── Form Grid ── */}
                        <div className="adddoc-grid">

                            <div className="adddoc-field">
                                <label>Document ID <span className="required">*</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. affidavit-patel-2024"
                                    value={form.doc_id}
                                    onChange={setField("doc_id")}
                                    className={formErrors.doc_id ? "field-error" : ""}
                                />
                                {formErrors.doc_id && <span className="field-error-msg">⚠ {formErrors.doc_id}</span>}
                                <span className="field-hint">Unique identifier — auto-filled from filename</span>
                            </div>

                            <div className="adddoc-field">
                                <label>Case <span className="required">*</span></label>
                                <select
                                    value={form.case_id}
                                    onChange={setField("case_id")}
                                    className={formErrors.case_id ? "field-error" : ""}
                                >
                                    <option value="">Select case</option>
                                    {cases.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.case_number} — {c.case_name}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.case_id && <span className="field-error-msg">⚠ {formErrors.case_id}</span>}
                            </div>

                            <div className="adddoc-field">
                                <label>Client <span className="required">*</span></label>
                                <select
                                    value={form.client_id}
                                    onChange={setField("client_id")}
                                    className={formErrors.client_id ? "field-error" : ""}
                                >
                                    <option value="">Select client</option>
                                    {clients.map((cl) => (
                                        <option key={cl.id} value={cl.id}>{cl.name}</option>
                                    ))}
                                </select>
                                {formErrors.client_id && <span className="field-error-msg">⚠ {formErrors.client_id}</span>}
                                {form.case_id && form.client_id && (
                                    <span className="field-hint field-hint-gold">Auto-filled from selected case</span>
                                )}
                            </div>

                            <div className="adddoc-field adddoc-field-full">
                                <label>Description <span className="optional">(optional)</span></label>
                                <textarea
                                    placeholder="Brief description of what this document contains..."
                                    value={form.description}
                                    onChange={setField("description")}
                                    rows={3}
                                />
                            </div>

                        </div>

                        {/* ── Info Banner ── */}
                        <div className="adddoc-info-banner">
                            <span className="adddoc-info-icon">🤖</span>
                            <span>
                                After upload, the document will be chunked and embedded into the vector store — enabling AI-powered queries and case summaries.
                            </span>
                        </div>

                        {/* ── Actions ── */}
                        <div className="adddoc-actions">
                            <button className="btn-cancel" onClick={() => navigate("/documents")}>Cancel</button>
                            <button className="btn-submit" onClick={handleSubmit} disabled={loading || success}>
                                {loading ? (
                                    <><span className="btn-spinner" /> Uploading & Embedding...</>
                                ) : (
                                    <><IconUpload /> Upload Document</>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}