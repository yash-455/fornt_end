import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./css/assistant.css";

const API_BASE = "http://localhost:8000";

// ── Icons ──
const IconSend = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);
const IconBot = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><line x1="12" y1="7" x2="12" y2="11" />
        <circle cx="8" cy="16" r="1" fill="currentColor" /><circle cx="16" cy="16" r="1" fill="currentColor" />
    </svg>
);
const IconUser = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const IconBriefcase = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
);
const IconFile = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
);
const IconPlus = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);
const IconTrash = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
);
const IconSearch = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const QUICK_PROMPTS = [
    "Summarize all my active cases",
    "List upcoming hearings",
    "Which cases are in trial stage?",
    "Show pending documents",
];

function TypingDots() {
    return (
        <div className="typing-dots">
            <span /><span /><span />
        </div>
    );
}

function MessageBubble({ msg }) {
    const isUser = msg.sender === "user";
    return (
        <div className={`msg-row ${isUser ? "msg-row--user" : "msg-row--ai"}`}>
            <div className={`msg-avatar ${isUser ? "msg-avatar--user" : "msg-avatar--ai"}`}>
                {isUser ? <IconUser /> : <IconBot />}
            </div>
            <div className={`msg-bubble ${isUser ? "msg-bubble--user" : "msg-bubble--ai"}`}>
                {msg.typing ? (
                    <TypingDots />
                ) : (
                    <div className="msg-text" style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
                )}
                {!msg.typing && msg.timestamp && (
                    <div className="msg-time">{msg.timestamp}</div>
                )}
            </div>
        </div>
    );
}

export default function Assistant() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ── Chat State ──
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "ai",
            text: "Hello! I'm your TrialDesk AI Assistant.\n\nI have access to all your cases, clients, hearings, and documents. Ask me anything — case summaries, hearing dates, document queries, or anything about your legal work.",
            timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        }
    ]);
    const [loading, setLoading] = useState(false);

    // ── Case & Doc Context State ──
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [caseDocs, setCaseDocs] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [mode, setMode] = useState("chat"); // "chat" | "doc"
    const [caseSearch, setCaseSearch] = useState("");

    // ── Sessions (local) ──
    const [sessions, setSessions] = useState([
        { id: 1, label: "General Assistant", active: true }
    ]);
    const [activeSession, setActiveSession] = useState(1);

    const session = JSON.parse(localStorage.getItem("trialdesk_session") || "null");
    const token = session?.token;

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!session) navigate("/", { replace: true });
    }, [session, navigate]);

    // ── Auto-scroll ──
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // ── Fetch cases ──
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

    // ── Fetch docs when case selected ──
    useEffect(() => {
        if (!selectedCase) { setCaseDocs([]); setSelectedDoc(null); return; }
        const fetchCaseDetail = async () => {
            try {
                const res = await fetch(`${API_BASE}/cases/get/${selectedCase.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setCaseDocs(Array.isArray(data.documents) ? data.documents : []);
            } catch (_) { setCaseDocs([]); }
        };
        fetchCaseDetail();
    }, [selectedCase, token]);

    const getTimestamp = () =>
        new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const addMessage = (sender, text, typing = false) => {
        const msg = { id: Date.now(), sender, text, typing, timestamp: getTimestamp() };
        setMessages(prev => [...prev, msg]);
        return msg.id;
    };

    const resolveTyping = (id, text) => {
        setMessages(prev =>
            prev.map(m => m.id === id ? { ...m, text, typing: false, timestamp: getTimestamp() } : m)
        );
    };

    // ── Send message ──
    const handleSend = async (overrideInput) => {
        const question = (overrideInput || input).trim();
        if (!question || loading) return;

        setInput("");
        addMessage("user", question);
        setLoading(true);

        const typingId = addMessage("ai", "", true);

        try {
            // ── Doc RAG mode: query specific document ──
            if (mode === "doc" && selectedDoc) {
                const res = await fetch(
                    `${API_BASE}/query/query?doc_id=${encodeURIComponent(selectedDoc.doc_id)}&query=${encodeURIComponent(question)}`,
                    {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const data = await res.json();
                resolveTyping(typingId, data.answer || "No answer found in the selected document.");
            } else {
                // ── General chat mode: full DB context for the user ──
                const res = await fetch(`${API_BASE}/chat/ask`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ question }),
                });
                const text = await res.text();
                resolveTyping(typingId, text || "Sorry, I couldn't find an answer.");
            }
        } catch (_) {
            resolveTyping(typingId, "Could not connect to the server. Please check if the backend is running.");
        }

        setLoading(false);
        inputRef.current?.focus();
    };

    // ── Case summary shortcut ──
    const handleCaseSummary = async (c) => {
        setLoading(true);
        addMessage("user", `Summarize case: ${c.case_name}`);
        const typingId = addMessage("ai", "", true);
        try {
            const res = await fetch(`${API_BASE}/query/summary/${c.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            resolveTyping(typingId, data.ai_summary || "No summary available for this case.");
        } catch (_) {
            resolveTyping(typingId, "Failed to generate case summary.");
        }
        setLoading(false);
    };

    // ── New session ──
    const handleNewSession = () => {
        const id = Date.now();
        setSessions(prev => [...prev, { id, label: `Session ${prev.length + 1}`, active: false }]);
        setActiveSession(id);
        setMessages([{
            id: Date.now(),
            sender: "ai",
            text: "New session started. What would you like to work on?",
            timestamp: getTimestamp(),
        }]);
        setSelectedCase(null);
        setSelectedDoc(null);
        setMode("chat");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const filteredCases = cases.filter(c =>
        !caseSearch ||
        c.case_name.toLowerCase().includes(caseSearch.toLowerCase()) ||
        c.case_number.toLowerCase().includes(caseSearch.toLowerCase())
    );

    if (!session) return null;

    return (
        <div className="dash-layout">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(v => !v)} session={session} />

            <main className="dash-main assistant-main">
                <div className="assistant-wrapper">

                    {/* ── LEFT: Session History ── */}
                    <aside className="asst-left">
                        <div className="asst-left-header">
                            <span className="asst-left-title">Conversations</span>
                            <button className="asst-new-btn" onClick={handleNewSession}>
                                <IconPlus /> New
                            </button>
                        </div>

                        <div className="asst-sessions">
                            {sessions.map(s => (
                                <button
                                    key={s.id}
                                    className={`asst-session-item ${activeSession === s.id ? "active" : ""}`}
                                    onClick={() => setActiveSession(s.id)}
                                >
                                    <IconBot />
                                    <span>{s.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Quick Prompts */}
                        <div className="asst-prompts-section">
                            <div className="asst-section-label">Quick Prompts</div>
                            {QUICK_PROMPTS.map((p, i) => (
                                <button
                                    key={i}
                                    className="asst-prompt-chip"
                                    onClick={() => handleSend(p)}
                                    disabled={loading}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* ── CENTER: Chat ── */}
                    <section className="asst-chat">
                        {/* Header */}
                        <div className="asst-chat-header">
                            <div className="asst-chat-header-left">
                                <div className="asst-chat-title">
                                    <IconBot />
                                    <span>AI Legal Assistant</span>
                                </div>
                                <div className="asst-mode-pills">
                                    <button
                                        className={`asst-mode-pill ${mode === "chat" ? "active" : ""}`}
                                        onClick={() => { setMode("chat"); setSelectedDoc(null); }}
                                    >
                                        Full Context
                                    </button>
                                    <button
                                        className={`asst-mode-pill ${mode === "doc" ? "active" : ""}`}
                                        onClick={() => setMode("doc")}
                                        disabled={!selectedDoc}
                                        title={!selectedDoc ? "Select a document from the right panel first" : "Query selected document"}
                                    >
                                        Document RAG
                                    </button>
                                </div>
                            </div>
                            <div className="topbar-avatar">{getInitials(session.name)}</div>
                        </div>

                        {/* Mode Banner */}
                        {mode === "doc" && selectedDoc && (
                            <div className="asst-doc-banner">
                                <IconFile />
                                <span>Querying: <strong>{selectedDoc.filename}</strong></span>
                                <button onClick={() => { setMode("chat"); setSelectedDoc(null); }}>✕</button>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="asst-messages">
                            {messages.map(msg => (
                                <MessageBubble key={msg.id} msg={msg} />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="asst-input-area">
                            <div className="asst-input-wrap">
                                <textarea
                                    ref={inputRef}
                                    className="asst-input"
                                    rows={1}
                                    placeholder={
                                        mode === "doc" && selectedDoc
                                            ? `Ask about "${selectedDoc.filename}"...`
                                            : "Ask anything about your cases, hearings, clients..."
                                    }
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={loading}
                                />
                                <button
                                    className="asst-send-btn"
                                    onClick={() => handleSend()}
                                    disabled={loading || !input.trim()}
                                >
                                    <IconSend />
                                </button>
                            </div>
                            <div className="asst-input-hint">
                                Press Enter to send · Shift+Enter for new line ·
                                {mode === "doc" ? " Document RAG mode active" : " Full database context active"}
                            </div>
                        </div>
                    </section>

                    {/* ── RIGHT: Case & Doc Context ── */}
                    <aside className="asst-right">
                        <div className="asst-section-label" style={{ marginBottom: 12 }}>Case Context</div>

                        {/* Case Search */}
                        <div className="asst-case-search">
                            <IconSearch />
                            <input
                                type="text"
                                placeholder="Search cases..."
                                value={caseSearch}
                                onChange={e => setCaseSearch(e.target.value)}
                            />
                        </div>

                        {/* Case List */}
                        <div className="asst-case-list">
                            {filteredCases.length === 0 ? (
                                <div className="asst-empty">No cases found</div>
                            ) : filteredCases.map(c => (
                                <div
                                    key={c.id}
                                    className={`asst-case-item ${selectedCase?.id === c.id ? "active" : ""}`}
                                    onClick={() => setSelectedCase(selectedCase?.id === c.id ? null : c)}
                                >
                                    <div className="asst-case-item-top">
                                        <span className="asst-case-number">{c.case_number}</span>
                                        <span className={`asst-case-status asst-case-status--${c.status}`}>
                                            {c.status}
                                        </span>
                                    </div>
                                    <div className="asst-case-name">{c.case_name}</div>
                                    {selectedCase?.id === c.id && (
                                        <button
                                            className="asst-summarize-btn"
                                            onClick={(e) => { e.stopPropagation(); handleCaseSummary(c); }}
                                            disabled={loading}
                                        >
                                            🤖 AI Summary
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Documents for selected case */}
                        {selectedCase && (
                            <>
                                <div className="asst-section-label" style={{ margin: "16px 0 10px" }}>
                                    <IconFile /> Documents
                                </div>
                                <div className="asst-doc-list">
                                    {caseDocs.length === 0 ? (
                                        <div className="asst-empty">No documents for this case</div>
                                    ) : caseDocs.map((doc, i) => (
                                        <div
                                            key={doc.doc_id || i}
                                            className={`asst-doc-item ${selectedDoc?.doc_id === doc.doc_id ? "active" : ""}`}
                                            onClick={() => {
                                                if (selectedDoc?.doc_id === doc.doc_id) {
                                                    setSelectedDoc(null);
                                                    setMode("chat");
                                                } else {
                                                    setSelectedDoc(doc);
                                                    setMode("doc");
                                                }
                                            }}
                                        >
                                            <IconFile />
                                            <div className="asst-doc-info">
                                                <span className="asst-doc-name">{doc.filename}</span>
                                                <span className="asst-doc-hint">
                                                    {selectedDoc?.doc_id === doc.doc_id ? "Active for RAG" : "Click to query"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </aside>

                </div>
            </main>
        </div>
    );
}