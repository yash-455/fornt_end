import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

// ── SVG Icons ──────────────────────────────────────────────────
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

const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
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

// Scales of Justice logo SVG (matching the reference image)
const ScalesLogo = () => (
  <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Center pole */}
    <rect x="48" y="10" width="4" height="55" fill="#D4AF37" />
    {/* Top ornament */}
    <circle cx="50" cy="10" r="4" fill="#D4AF37" />
    {/* Crossbar */}
    <rect x="15" y="28" width="70" height="3" rx="1.5" fill="#D4AF37" />
    {/* Left chain */}
    <line x1="25" y1="31" x2="22" y2="52" stroke="#D4AF37" strokeWidth="2" />
    {/* Right chain */}
    <line x1="75" y1="31" x2="78" y2="52" stroke="#D4AF37" strokeWidth="2" />
    {/* Left pan */}
    <path d="M10 52 Q22 58 34 52" stroke="#D4AF37" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <line x1="10" y1="52" x2="34" y2="52" stroke="#D4AF37" strokeWidth="1.5" />
    {/* Right pan */}
    <path d="M66 52 Q78 58 90 52" stroke="#D4AF37" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <line x1="66" y1="52" x2="90" y2="52" stroke="#D4AF37" strokeWidth="1.5" />
    {/* Base book */}
    <ellipse cx="50" cy="68" rx="22" ry="5" fill="#D4AF37" opacity="0.9" />
    <rect x="29" y="63" width="42" height="8" rx="2" fill="#D4AF37" opacity="0.8" />
    <line x1="50" y1="63" x2="50" y2="71" stroke="#0B1320" strokeWidth="1.5" opacity="0.5" />
  </svg>
);

// ── localStorage-backed user store ──
function getUsers() {
  try { return JSON.parse(localStorage.getItem("trialdesk_users") || "[]"); }
  catch { return []; }
}
function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem("trialdesk_users", JSON.stringify(users));
}
function findUser(email, password) {
  return getUsers().find((u) => u.email === email && u.password === password);
}
function findUserByEmail(email) {
  return getUsers().find((u) => u.email === email);
}

function validate(fields, mode) {
  const errs = {};
  if (mode === "register") {
    if (!fields.name?.trim()) errs.name = "Full name is required";
    if (!fields.firm?.trim()) errs.firm = "Firm name is required";
  }
  if (!fields.email) errs.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(fields.email)) errs.email = "Enter a valid email";
  if (!fields.password) errs.password = "Password is required";
  else if (fields.password.length < 6) errs.password = "Minimum 6 characters";
  if (mode === "register" && fields.password && fields.confirm !== fields.password)
    errs.confirm = "Passwords do not match";
  return errs;
}

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [fields, setFields] = useState({ name: "", firm: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [globalMsg, setGlobalMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState(null);

  const setField = (key) => (e) => {
    setFields((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
    setGlobalMsg(null);
  };

  const switchTab = (t) => {
    setTab(t);
    setErrors({});
    setGlobalMsg(null);
    setShowPass(false);
    setShowConfirm(false);
    setFields({ name: "", firm: "", email: "", password: "", confirm: "" });
  };

  const handleSubmit = async () => {
    const errs = validate(fields, tab);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));

    if (tab === "login") {
      const found = findUser(fields.email, fields.password);
      if (!found) {
        setGlobalMsg({ type: "error", text: "Invalid email or password." });
        setLoading(false);
        return;
      }
      localStorage.setItem("trialdesk_session", JSON.stringify(found));
      setLoading(false);
      navigate("/dashboard");
      return;
    } else {
      if (findUserByEmail(fields.email)) {
        setGlobalMsg({ type: "error", text: "An account with this email already exists." });
        setLoading(false);
        return;
      }
      saveUser({ id: Date.now(), name: fields.name, firm: fields.firm, email: fields.email, password: fields.password });
      setGlobalMsg({ type: "success", text: "Account created! Please log in." });
      setLoading(false);
      switchTab("login");
      return;
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  const handleForgotPassword = () => {
    if (!forgotEmail || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      setForgotMsg({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    const found = findUserByEmail(forgotEmail);
    if (!found) {
      setForgotMsg({ type: "error", text: "No account found with this email." });
    } else {
      setForgotMsg({ type: "success", text: `Password reset link sent to ${forgotEmail}. Check your inbox!` });
    }
  };



  return (
    <div className="page">

      {/* ── LEFT PANEL ── */}
      <div className="left-panel">
        <div className="left-bg" />
        <div className="gold-line" />
        <div className="grid-overlay" />

        {/* Courthouse silhouette */}
        <div className="courthouse-wrap">
          <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 520 }}>
            {/* Pediment / triangle roof */}
            <polygon points="250,30 50,130 450,130" fill="#D4AF37" />
            {/* Entablature */}
            <rect x="50" y="130" width="400" height="20" fill="#D4AF37" />
            {/* Columns */}
            {[90, 150, 210, 270, 330, 390].map((x, i) => (
              <rect key={i} x={x} y="150" width="22" height="200" rx="3" fill="#D4AF37" />
            ))}
            {/* Steps */}
            <rect x="30" y="350" width="440" height="14" rx="2" fill="#D4AF37" />
            <rect x="15" y="364" width="470" height="12" rx="2" fill="#D4AF37" />
          </svg>
        </div>

        {/* CSS gavel/books decorative elements */}
        <div className="gavel-wrap">
          <div className="gavel-head" />
          <div className="gavel-handle" />
        </div>

        <div className="left-content">
          {/* Brand */}
          <div className="brand-row">
            <ScalesLogo />
            <span className="brand-name">TrialDesk</span>
          </div>

          {/* Hero text */}
          <div className="hero-title">
            Workspace<br />for Modern Law Firms
          </div>

          {/* Feature list */}
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

      {/* ── RIGHT PANEL ── */}
      <div className="right-panel">
        <div className="form-card">

          <div className="form-title">
            {tab === "login" ? "Sign in to TrialDesk" : "Create your account"}
          </div>

          {/* Global message */}
          {globalMsg && (
            <div className={globalMsg.type === "error" ? "global-error" : "global-success"}>
              {globalMsg.type === "error" ? "⚠ " : "✓ "}{globalMsg.text}
            </div>
          )}

          <div className="field-group">

            {/* Register: Name + Firm */}
            {tab === "register" && (
              <div className="field-row-2">
                <div className="field">
                  <label htmlFor="name">Full Name</label>
                  <div className="input-wrap">
                    <span className="input-icon"><IconUser /></span>
                    <input id="name" type="text" placeholder="Alexandra Hart" value={fields.name} onChange={setField("name")} className={errors.name ? "error-field" : ""} onKeyDown={handleKeyDown} />
                    <span className="input-focus-line" />
                  </div>
                  {errors.name && <span className="error-msg">⚠ {errors.name}</span>}
                </div>
                <div className="field">
                  <label htmlFor="firm">Firm Name</label>
                  <div className="input-wrap">
                    <span className="input-icon"><IconBuilding /></span>
                    <input id="firm" type="text" placeholder="Hart & Associates" value={fields.firm} onChange={setField("firm")} className={errors.firm ? "error-field" : ""} onKeyDown={handleKeyDown} />
                    <span className="input-focus-line" />
                  </div>
                  {errors.firm && <span className="error-msg">⚠ {errors.firm}</span>}
                </div>
              </div>
            )}

            {/* Email */}
            <div className="field">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrap">
                <span className="input-icon"><IconEmail /></span>
                <input id="email" type="email" placeholder="demo@trialdesk.law" value={fields.email} onChange={setField("email")} className={errors.email ? "error-field" : ""} onKeyDown={handleKeyDown} />
                <span className="input-focus-line" />
              </div>
              {errors.email && <span className="error-msg">⚠ {errors.email}</span>}
            </div>

            {/* Password */}
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <span className="input-icon"><IconLock /></span>
                <input id="password" type={showPass ? "text" : "password"} placeholder={tab === "login" ? "Enter your password" : "Min. 6 characters"} value={fields.password} onChange={setField("password")} className={errors.password ? "error-field" : ""} onKeyDown={handleKeyDown} />
                <span className="input-focus-line" />
                <button className="eye-btn" onClick={() => setShowPass((v) => !v)} type="button" tabIndex={-1}>
                  {showPass ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {errors.password && <span className="error-msg">⚠ {errors.password}</span>}
            </div>

            {/* Confirm password (register) */}
            {tab === "register" && (
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
                {errors.confirm && <span className="error-msg">⚠ {errors.confirm}</span>}
              </div>
            )}
          </div>

          {/* Remember me + Forgot password (login only) */}
          {tab === "login" && (
            <div className="meta-row">
              <div className="remember-wrap" onClick={() => setRemember((v) => !v)}>
                <div className={`custom-checkbox ${remember ? "checked" : ""}`}>
                  {remember && <IconCheck />}
                </div>
                <span className="remember-label">Remember me</span>
              </div>
              <button className="forgot-link" onClick={() => { setShowForgot(true); setForgotEmail(""); setForgotMsg(null); }}>Forgot password?</button>
            </div>
          )}

          {/* Submit */}
          <button className="submit-btn" onClick={handleSubmit} disabled={loading} style={{ marginTop: tab === "register" ? 24 : 0 }}>
            {loading && <span className="spinner" />}
            {loading
              ? (tab === "login" ? "Signing in…" : "Creating account…")
              : (tab === "login" ? "Sign In" : "Create Account")}
          </button>

          {/* Footer link */}
          <div className="footer-note">
            {tab === "login" ? (
              <>Don't have an account?{" "}<button onClick={() => switchTab("register")}>Register</button></>
            ) : (
              <>Already have an account?{" "}<button onClick={() => switchTab("login")}>Sign in</button></>
            )}
          </div>

        </div>

        {/* ── FORGOT PASSWORD MODAL ── */}
        {showForgot && (
          <div className="modal-overlay" onClick={() => setShowForgot(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowForgot(false)}>✕</button>
              <div className="modal-title">Reset Password</div>
              <p className="modal-desc">Enter your email and we&apos;ll send you a reset link.</p>
              {forgotMsg && (
                <div className={forgotMsg.type === "error" ? "global-error" : "global-success"}>
                  {forgotMsg.type === "error" ? "⚠ " : "✓ "}{forgotMsg.text}
                </div>
              )}
              <div className="field">
                <label htmlFor="forgot-email">Email Address</label>
                <div className="input-wrap">
                  <span className="input-icon"><IconEmail /></span>
                  <input id="forgot-email" type="email" placeholder="demo@trialdesk.law" value={forgotEmail} onChange={(e) => { setForgotEmail(e.target.value); setForgotMsg(null); }} onKeyDown={(e) => { if (e.key === "Enter") handleForgotPassword(); }} />
                  <span className="input-focus-line" />
                </div>
              </div>
              <button className="submit-btn" style={{ marginTop: 20 }} onClick={handleForgotPassword}>Send Reset Link</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
