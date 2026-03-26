import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/register.css";

const IconEmail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="2,4 12,13 22,4" />
  </svg>
);

const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconBuilding = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <path d="M3 9h18M9 21V9" />
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

const API_BASE = "http://localhost:8000";

function validate(fields) {
  const errs = {};
  if (!fields.name?.trim()) errs.name = "Full name is required";
  if (!fields.firm?.trim()) errs.firm = "Firm name is required";
  if (!fields.email) errs.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(fields.email)) errs.email = "Enter a valid email";
  if (!fields.password) errs.password = "Password is required";
  else if (fields.password.length < 6) errs.password = "Minimum 6 characters";
  if (fields.password && fields.confirm !== fields.password) errs.confirm = "Passwords do not match";
  return errs;
}

export default function Register() {
  const navigate = useNavigate();
  const [fields, setFields] = useState({ name: "", firm: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [globalMsg, setGlobalMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const setField = (key) => (e) => {
    setFields((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
    setGlobalMsg(null);
  };

  const handleSubmit = async () => {
    const errs = validate(fields);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name,
          email: fields.email,
          password: fields.password,
          firm_name: fields.firm || null,
        }),
      });

      const data = await res.json();

      if (data.message === "Email already registered") {
        setGlobalMsg({ type: "error", text: "An account with this email already exists." });
        setLoading(false);
        return;
      }

      if (data.message === "User registered successfully" || data.id) {
        setGlobalMsg({ type: "success", text: "Account created successfully. Redirecting to login..." });
        setLoading(false);
        setTimeout(() => navigate("/login"), 900);
        return;
      }

      setGlobalMsg({ type: "error", text: data.error || "Registration failed. Please try again." });
    } catch (err) {
      setGlobalMsg({ type: "error", text: "Could not connect to server. Is the backend running?" });
    }

    setLoading(false);
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
          <div className="form-title">Create your account</div>

          {globalMsg && (
            <div className={globalMsg.type === "error" ? "global-error" : "global-success"}>
              {globalMsg.type === "error" ? "! " : "OK "}{globalMsg.text}
            </div>
          )}

          <div className="field-group">
            <div className="field-row-2">
              <div className="field">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrap">
                  <span className="input-icon"><IconUser /></span>
                  <input id="name" type="text" placeholder="Alexandra Hart" value={fields.name} onChange={setField("name")} className={errors.name ? "error-field" : ""} onKeyDown={handleKeyDown} />
                  <span className="input-focus-line" />
                </div>
                {errors.name && <span className="error-msg">! {errors.name}</span>}
              </div>
              <div className="field">
                <label htmlFor="firm">Firm Name</label>
                <div className="input-wrap">
                  <span className="input-icon"><IconBuilding /></span>
                  <input id="firm" type="text" placeholder="Hart and Associates" value={fields.firm} onChange={setField("firm")} className={errors.firm ? "error-field" : ""} onKeyDown={handleKeyDown} />
                  <span className="input-focus-line" />
                </div>
                {errors.firm && <span className="error-msg">! {errors.firm}</span>}
              </div>
            </div>

            <div className="field">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon"><IconEmail /></span>
                <input id="email" type="email" placeholder="demo@trialdesk.law" value={fields.email} onChange={setField("email")} className={errors.email ? "error-field" : ""} onKeyDown={handleKeyDown} />
                <span className="input-focus-line" />
              </div>
              {errors.email && <span className="error-msg">! {errors.email}</span>}
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <span className="input-icon"><IconLock /></span>
                <input id="password" type={showPass ? "text" : "password"} placeholder="Min. 6 characters" value={fields.password} onChange={setField("password")} className={errors.password ? "error-field" : ""} onKeyDown={handleKeyDown} />
                <span className="input-focus-line" />
                <button className="eye-btn" onClick={() => setShowPass((v) => !v)} type="button" tabIndex={-1}>
                  {showPass ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {errors.password && <span className="error-msg">! {errors.password}</span>}
            </div>

            <div className="field">
              <label htmlFor="confirm">Confirm Password</label>
              <div className="input-wrap">
                <span className="input-icon"><IconLock /></span>
                <input id="confirm" type={showConfirm ? "text" : "password"} placeholder="Repeat password" value={fields.confirm} onChange={setField("confirm")} className={errors.confirm ? "error-field" : ""} onKeyDown={handleKeyDown} />
                <span className="input-focus-line" />
                <button className="eye-btn" onClick={() => setShowConfirm((v) => !v)} type="button" tabIndex={-1}>
                  {showConfirm ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {errors.confirm && <span className="error-msg">! {errors.confirm}</span>}
            </div>
          </div>

          <button className="submit-btn" onClick={handleSubmit} disabled={loading} style={{ marginTop: 24 }}>
            {loading && <span className="spinner" />}
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <div className="footer-note">
            Already have an account? <button onClick={() => navigate("/login")}>Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
}
