import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/forgotpassword.css";

const IconEmail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="2,4 12,13 22,4" />
  </svg>
);

const ScalesLogo = () => (
  <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="48" y="10" width="4" height="55" fill="#D4AF37" />
    <circle cx="50" cy="10" r="4" fill="#D4AF37" />
    <rect x="15" y="28" width="70" height="3" rx="1.5" fill="#D4AF37" />
    <line x1="25" y1="31" x2="22" y2="52" stroke="#D4AF37" strokeWidth="2" />
    <line x1="75" y1="31" x2="78" y2="52" stroke="#D4AF37" strokeWidth="2" />
    <path d="M10 52 Q22 58 34 52" stroke="#D4AF37" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <line x1="10" y1="52" x2="34" y2="52" stroke="#D4AF37" strokeWidth="1.5" />
    <path d="M66 52 Q78 58 90 52" stroke="#D4AF37" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <line x1="66" y1="52" x2="90" y2="52" stroke="#D4AF37" strokeWidth="1.5" />
    <ellipse cx="50" cy="68" rx="22" ry="5" fill="#D4AF37" opacity="0.9" />
    <rect x="29" y="63" width="42" height="8" rx="2" fill="#D4AF37" opacity="0.8" />
    <line x1="50" y1="63" x2="50" y2="71" stroke="#0B1320" strokeWidth="1.5" opacity="0.5" />
  </svg>
);

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);

  const handleSubmit = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setMsg({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    setMsg({ type: "success", text: `Password reset link sent to ${email}. Check your inbox.` });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="page">
      <div className="left-panel">
        <div className="left-bg" />
        <div className="gold-line" />
        <div className="grid-overlay" />

        <div className="courthouse-wrap">
          <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 520 }}>
            <polygon points="250,30 50,130 450,130" fill="#D4AF37" />
            <rect x="50" y="130" width="400" height="20" fill="#D4AF37" />
            {[90, 150, 210, 270, 330, 390].map((x, i) => (
              <rect key={i} x={x} y="150" width="22" height="200" rx="3" fill="#D4AF37" />
            ))}
            <rect x="30" y="350" width="440" height="14" rx="2" fill="#D4AF37" />
            <rect x="15" y="364" width="470" height="12" rx="2" fill="#D4AF37" />
          </svg>
        </div>

        <div className="gavel-wrap">
          <div className="gavel-head" />
          <div className="gavel-handle" />
        </div>

        <div className="left-content">
          <div className="brand-row">
            <ScalesLogo />
            <span className="brand-name">TrialDesk</span>
          </div>
          <div className="hero-title">
            Workspace<br />for Modern Law Firms
          </div>
          <div className="features">
            {["Manage Cases", "Track Hearings", "Secure Documents", "AI Legal Assistant"].map((f) => (
              <div className="feature-item" key={f}>
                <svg className="feature-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="form-card">
          <div className="form-title">Reset your password</div>

          <p className="modal-desc" style={{ marginBottom: 20 }}>
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {msg && (
            <div className={msg.type === "error" ? "global-error" : "global-success"}>
              {msg.type === "error" ? "! " : "OK "}{msg.text}
            </div>
          )}

          <div className="field-group">
            <div className="field">
              <label htmlFor="forgot-email">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon"><IconEmail /></span>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="demo@trialdesk.law"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setMsg(null);
                  }}
                  onKeyDown={handleKeyDown}
                />
                <span className="input-focus-line" />
              </div>
            </div>
          </div>

          <button className="submit-btn" onClick={handleSubmit} style={{ marginTop: 20 }}>
            Send Reset Link
          </button>

          <div className="footer-note">
            Remembered your password? <button onClick={() => navigate("/login")}>Sign in</button>
          </div>
          <div className="footer-note" style={{ marginTop: 10 }}>
            Need an account? <button onClick={() => navigate("/register")}>Register</button>
          </div>
        </div>
      </div>
    </div>
  );
}
