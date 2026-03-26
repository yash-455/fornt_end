import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./css/assistant.css"; 

const Assistant = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { 
      sender: "ai", 
      text: "Hello! I am your LegalAssist AI. I am securely connected to your workspace. Select a case file on the right, or ask me a question to get started." 
    }
  ]);

  const quickPrompts = [
    "Summarize the active document",
    "Extract all dates and deadlines",
    "Identify liability clauses"
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");

    // Simulate AI "Thinking" and responding
    setTimeout(() => {
      setMessages((prev) => [
        ...prev, 
        { 
          sender: "ai", 
          text: "Based on the uploaded Smith v. Jones contract, the liability clause is located in Section 4, Paragraph 2. It states that the tenant is responsible for all structural repairs. [Doc 1, Page 4]" 
        }
      ]);
    }, 1500);
  };

  return (
    <div className="assistant-layout">
      
      {/* LEFT COLUMN: Chat History */}
      <aside className="assistant-sidebar-left">
        <div className="sidebar-header">
          <Link to="/dashboard" className="back-btn">← Back to Dashboard</Link>
          <button className="new-chat-btn">+ New Chat</button>
        </div>
        
        <div className="history-list">
          <h4 className="section-title">Recent Conversations</h4>
          <button className="history-item active">Smith v. Jones Summary</button>
          <button className="history-item">Lease Agreement Review</button>
          <button className="history-item">Motion to Dismiss Draft</button>
          <button className="history-item">Precedent Search: IP Law</button>
        </div>
      </aside>

      {/* CENTER COLUMN: Main Chat Interface */}
      <main className="assistant-chat-area">
        
        {/* NEW DASHBOARD HEADER */}
        <header className="chat-header">
          <h2>AI Assistant</h2>
          <div className="header-actions">
            <button className="notification-btn">🔔</button>
            <div className="user-profile">
              <div className="avatar">YA</div> {/* You can replace this with an <img /> tag if you have a profile picture */}
            </div>
          </div>
        </header>

        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.sender}`}>
              <div className="message-bubble">
                <p>{msg.text}</p>
                {msg.sender === "ai" && index !== 0 && (
                  <div className="message-actions">
                    <button>💾 Save to Case</button>
                    <button>📋 Copy</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="chat-input-container">
          <div className="quick-prompts">
            {quickPrompts.map((prompt, i) => (
              <button key={i} className="prompt-chip" onClick={() => setInput(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
          
          <form className="input-form" onSubmit={handleSend}>
            <button type="button" className="attach-btn">📎</button>
            <input 
              type="text" 
              placeholder="Ask anything about your case files..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="send-btn">Send</button>
          </form>
          <p className="disclaimer">AI can make mistakes. Always verify important legal information.</p>
        </div>
      </main>

      {/* RIGHT COLUMN: RAG Context & Files */}
      <aside className="assistant-sidebar-right">
        <h4 className="section-title">Active Context</h4>
        <p className="context-desc">The AI is currently analyzing these files to answer your questions.</p>

        <div className="context-selector">
          <label>Select Case:</label>
          <select>
            <option>Case #1042 - Smith v. Jones</option>
            <option>Case #1088 - Estate Planning</option>
            <option>All Uploaded Cases</option>
          </select>
        </div>

        <div className="document-list">
          <h4 className="section-title">Referenced Documents</h4>
          <div className="doc-item">
            <span className="doc-icon">📄</span>
            <div className="doc-info">
              <span className="doc-name">Signed_Lease_Agreement.pdf</span>
              <span className="doc-status">Indexed • 12 Pages</span>
            </div>
          </div>
          <div className="doc-item">
            <span className="doc-icon">📄</span>
            <div className="doc-info">
              <span className="doc-name">Client_Affidavit_Draft.docx</span>
              <span className="doc-status">Indexed • 3 Pages</span>
            </div>
          </div>
        </div>

        <button className="upload-context-btn">+ Upload to Context</button>
      </aside>

    </div>
  );
};

export default Assistant;