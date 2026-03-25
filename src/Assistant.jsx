import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./assistant.css";

const IconSearch = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const IconBell = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const IconSpark = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2Z" />
        <path d="M5 19l.9 2.1L8 22l-2.1.9L5 25l-.9-2.1L2 22l2.1-.9L5 19Z" />
    </svg>
);

const IconSend = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4Z" />
    </svg>
);

const IconShield = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
);

const IconClock = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
    </svg>
);

const IconDatabase = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
        <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </svg>
);

const IconArrowRight = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" /><path d="m13 5 7 7-7 7" />
    </svg>
);

const IconFolder = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
    </svg>
);

const IconFileText = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

const IconLayers = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 2 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 17 9 5 9-5" />
    </svg>
);

const suggestedPrompts = [
    "Summarize the latest documents in Rivera Family Trust",
    "List missing documents before the next Johnson Estate Trust hearing",
    "Draft a client-ready update using the newest case activity in Smith v. Anderson Corp",
];

const matterOptions = [
    { name: "Rivera Family Trust", type: "Trust Matter", status: "Hearing in 2 days" },
    { name: "Johnson Estate Trust", type: "Estate Matter", status: "3 pending documents" },
    { name: "Smith v. Anderson Corp", type: "Commercial Litigation", status: "Recent filing uploaded" },
];

const sourceRecords = [
    { title: "Rivera Hearing Notes", meta: "Hearing notes | Updated Mar 24, 2026", icon: IconFileText },
    { title: "Trust Amendment Packet", meta: "Case document | 12 pages indexed", icon: IconFolder },
    { title: "Client Communication Log", meta: "Internal notes | 8 entries available", icon: IconLayers },
];

const indexingStatus = [
    { label: "Indexed cases", value: "24", detail: "Available for retrieval" },
    { label: "Indexed documents", value: "128", detail: "Chunked and searchable" },
    { label: "Pending uploads", value: "3", detail: "Awaiting indexing" },
];

const assistantMessages = [
    {
        role: "assistant",
        title: "AI Litigation Agent",
        text: "I'm synced with your cases, hearings, and documents. I can draft, summarize, cross-reference deadlines, and surface risks before they become urgent.",
    },
    {
        role: "user",
        title: "You",
        text: "Prepare a concise strategy brief for the Rivera Family Trust hearing and flag anything still missing.",
    },
    {
        role: "assistant",
        title: "AI Litigation Agent",
        text: "I would start with the hearing agenda, attach the most recent trust amendments, and request one final confirmation on witness availability. I can also draft the strategy brief in firm style.",
    },
];

export default function Assistant() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const session = JSON.parse(localStorage.getItem("trialdesk_session") || "null");

    useEffect(() => {
        if (!session) {
            navigate("/", { replace: true });
        }
    }, [session, navigate]);

    if (!session) return null;

    const getInitials = (name) => {
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="dash-layout">
            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen((value) => !value)}
                session={session}
            />

            <main className="dash-main assistant-main">
                <header className="dash-topbar">
                    <div className="topbar-left">
                        <h1 className="topbar-title">AI Assistant</h1>
                        <span className="topbar-subtitle">Professional legal workflow support for {session.firm}</span>
                    </div>
                    <div className="topbar-right">
                        <div className="search-bar">
                            <span className="search-icon"><IconSearch /></span>
                            <input type="text" placeholder="Search prompts, workflows, or cases..." />
                        </div>
                        <button className="topbar-icon-btn notification-btn">
                            <IconBell />
                            <span className="notification-dot" />
                        </button>
                        <div className="topbar-avatar">
                            {getInitials(session.name)}
                        </div>
                    </div>
                </header>

                <section className="assistant-hero">
                    <div className="assistant-hero-copy">
                        <span className="assistant-eyebrow">
                            <IconSpark />
                            Internal RAG Assistant
                        </span>
                        <h2 className="assistant-hero-title">AI assistance grounded only in your firm's uploaded records.</h2>
                        <p className="assistant-hero-text">
                            This workspace is designed for case-grounded answers, document summaries, and practical next steps
                            using the data already stored in your matters, hearings, and internal documents.
                        </p>
                        <div className="assistant-hero-actions">
                            <button className="assistant-primary-btn">Start New Task</button>
                            <button className="assistant-secondary-btn">View Indexed Records</button>
                        </div>
                    </div>

                    <div className="assistant-hero-panel">
                        <div className="assistant-panel-header">
                            <div>
                                <span className="assistant-panel-label">Data Scope</span>
                                <h3>What this assistant can use</h3>
                            </div>
                            <span className="assistant-status-pill">Secure Mode</span>
                        </div>
                        <div className="assistant-signal-grid">
                            <div className="assistant-signal-card">
                                <span className="assistant-signal-icon"><IconShield /></span>
                                <div>
                                    <strong>Cases and hearings</strong>
                                    <p>Retrieves from matter details, hearing schedules, and case activity stored internally.</p>
                                </div>
                            </div>
                            <div className="assistant-signal-card">
                                <span className="assistant-signal-icon"><IconDatabase /></span>
                                <div>
                                    <strong>Uploaded documents</strong>
                                    <p>Uses indexed files and notes already added to the database for grounded responses.</p>
                                </div>
                            </div>
                            <div className="assistant-signal-card">
                                <span className="assistant-signal-icon"><IconClock /></span>
                                <div>
                                    <strong>Missing-data awareness</strong>
                                    <p>Can surface when a matter has limited context, pending uploads, or incomplete records.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="assistant-content-grid">
                    <article className="assistant-chat-card assistant-matter-card">
                        <div className="section-header">
                            <div>
                                <h2 className="section-title">Matter Context</h2>
                                <p className="assistant-section-note">Choose a case or trust matter before asking the assistant to keep retrieval focused.</p>
                            </div>
                        </div>

                        <div className="assistant-matter-grid">
                            {matterOptions.map((matter) => (
                                <button className="assistant-matter-option" key={matter.name}>
                                    <div>
                                        <strong>{matter.name}</strong>
                                        <p>{matter.type}</p>
                                    </div>
                                    <span>{matter.status}</span>
                                </button>
                            ))}
                        </div>
                    </article>

                    <article className="assistant-chat-card">
                        <div className="section-header">
                            <div>
                                <h2 className="section-title">Agent Console</h2>
                                <p className="assistant-section-note">Ask questions, request summaries, or draft responses using selected matter context.</p>
                            </div>
                            <button className="view-all-btn">Open Full Console</button>
                        </div>

                        <div className="assistant-message-list">
                            {assistantMessages.map((message, index) => (
                                <div
                                    key={`${message.role}-${index}`}
                                    className={`assistant-message assistant-message-${message.role}`}
                                >
                                    <div className="assistant-message-meta">
                                        <span className="assistant-message-role">{message.title}</span>
                                        <span className="assistant-message-time">Live session</span>
                                    </div>
                                    <p>{message.text}</p>
                                </div>
                            ))}
                        </div>

                        <div className="assistant-composer">
                            <textarea
                                rows="3"
                                defaultValue="Draft a concise client-ready summary with pending risks, dependencies, and recommended next actions."
                            />
                            <button className="assistant-send-btn">
                                <IconSend />
                                Run Agent
                            </button>
                        </div>
                    </article>

                    <aside className="assistant-sidebar-column">
                        <article className="assistant-side-card">
                            <div className="section-header assistant-compact-header">
                                <h2 className="section-title">Suggested Prompts</h2>
                                <p className="assistant-section-note">These should later come from recent matter activity and available indexed records.</p>
                            </div>
                            <div className="assistant-prompt-list">
                                {suggestedPrompts.map((prompt) => (
                                    <button className="assistant-prompt-card" key={prompt}>
                                        <span>{prompt}</span>
                                        <IconArrowRight />
                                    </button>
                                ))}
                            </div>
                        </article>

                        <article className="assistant-side-card">
                            <div className="section-header assistant-compact-header">
                                <h2 className="section-title">Source Context</h2>
                            </div>
                            <div className="assistant-source-list">
                                {sourceRecords.map((record) => (
                                    <div className="assistant-source-item" key={record.title}>
                                        <span className="assistant-source-icon"><record.icon /></span>
                                        <div>
                                            <strong>{record.title}</strong>
                                            <p>{record.meta}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="assistant-side-card">
                            <div className="section-header assistant-compact-header">
                                <h2 className="section-title">Indexing Status</h2>
                            </div>
                            <div className="assistant-status-list">
                                {indexingStatus.map((item) => (
                                    <div className="assistant-status-item" key={item.label}>
                                        <div>
                                            <strong>{item.label}</strong>
                                            <p>{item.detail}</p>
                                        </div>
                                        <span className="assistant-status-value">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </aside>
                </section>
            </main>
        </div>
    );
}
