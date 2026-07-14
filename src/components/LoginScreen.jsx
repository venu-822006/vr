import { useState } from "react";
import { User, Phone, KeyRound, Eye, EyeOff, Check, X } from "lucide-react";
import { styles } from "../styles/styles";
import { verifyOwnerLogin } from "../utils/ownerAuth";
import LangToggle from "./LangToggle";
import ContactBar from "./ContactBar";

// Mirrors the backend's strongPassword rule exactly — client-side check is
// just for instant feedback; the server re-validates regardless.
function passwordChecks(pw) {
  return {
    length: pw.length >= 8,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
}
function isStrongPassword(pw) {
  return Object.values(passwordChecks(pw)).every(Boolean);
}

// Small live checklist shown under a password field while it's being created.
function PasswordStrengthHints({ password, t }) {
  const checks = passwordChecks(password);
  const items = [
    [checks.length, t.pwHintLength],
    [checks.upper, t.pwHintUpper],
    [checks.lower, t.pwHintLower],
    [checks.number, t.pwHintNumber],
    [checks.special, t.pwHintSpecial],
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", marginTop: 6, marginBottom: 2 }}>
      {items.map(([ok, label], i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11.5, color: ok ? "var(--leaf-deep)" : "var(--ink-soft)" }}>
          {ok ? <Check size={12} /> : <X size={12} />} {label}
        </span>
      ))}
    </div>
  );
}

// Small reusable password field with a show/hide toggle.
function PasswordField({ value, onChange, placeholder, t }) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={visible ? "text" : "password"}
        style={{ ...styles.textInput, paddingRight: 40 }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        aria-label={visible ? t.hidePassword : t.showPassword}
        onClick={() => setVisible((v) => !v)}
        style={{
          position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", padding: 4, cursor: "pointer",
          color: "var(--ink-soft)", display: "flex", alignItems: "center"
        }}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function LoginScreen({ lang, setLang, onCustomerLogin, onOwnerLogin, t }) {
  const [tab, setTab] = useState("customer");
  const [hoveredTab, setHoveredTab] = useState(null);

  // --- Customer -----------------------------------------------------------
  const [mode, setMode] = useState("login"); // login | signup | forgot
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canContinueCustomer = mode === "signup"
    ? name.trim().length > 1 && /^\d{10}$/.test(phone) && isStrongPassword(password)
    : /^\d{10}$/.test(phone) && password.length >= 1;

  const submitCustomer = async () => {
    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "signup" ? "/api/auth/register" : "/api/auth/login";
      const body = mode === "signup" ? { name, phone, password: password.trim() } : { phone, password: password.trim() };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Authentication failed");
        setLoading(false);
        return;
      }

      onCustomerLogin({
        name: data.user.name,
        phone: data.user.phone,
        role: data.user.role,
        token: data.token
      }, mode === "signup" ? true : rememberMe);
    } catch (err) {
      console.error(err);
      setError("⚠️ Couldn't reach the server. Please check your connection and try again.");
      setLoading(false);
    }
  };

  // --- Forgot / reset password ---------------------------------------------
  const [resetPhone, setResetPhone] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetStep, setResetStep] = useState("request"); // request | verify | done
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [devCode, setDevCode] = useState("");

  const enterForgotMode = () => {
    setMode("forgot");
    setError("");
    setResetError("");
    setResetStep("request");
    setResetPhone(phone);
    setResetCode("");
    setNewPassword("");
    setDevCode("");
  };

  const backToLoginMode = () => {
    setMode("login");
    setResetError("");
  };

  const requestResetCode = async () => {
    setResetLoading(true);
    setResetError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: resetPhone })
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.error || "Couldn't send reset code");
        setResetLoading(false);
        return;
      }
      if (data.devCode) setDevCode(data.devCode); // demo-mode only, no SMS gateway
      setResetStep("verify");
    } catch (err) {
      console.error(err);
      setResetError("⚠️ Couldn't reach the server. Please try again.");
    }
    setResetLoading(false);
  };

  const submitReset = async () => {
    setResetLoading(true);
    setResetError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: resetPhone, code: resetCode, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.error || "Couldn't reset password");
        setResetLoading(false);
        return;
      }
      setResetStep("done");
    } catch (err) {
      console.error(err);
      setResetError("⚠️ Couldn't reach the server. Please try again.");
    }
    setResetLoading(false);
  };

  // --- Owner --------------------------------------------------------------
  const [ownerUser, setOwnerUser] = useState("");
  const [ownerPass, setOwnerPass] = useState("");
  const [checkingOwner, setCheckingOwner] = useState(false);
  const [hoveredPrimaryBtn, setHoveredPrimaryBtn] = useState(false);
  const [hoveredLinkBtn, setHoveredLinkBtn] = useState(false);

  const submitOwner = async () => {
    setCheckingOwner(true);
    setError("");
    const result = await verifyOwnerLogin(ownerUser.trim(), ownerPass);
    setCheckingOwner(false);
    if (result.success) {
      onOwnerLogin();
    } else {
      setError(result.error || t.invalidLogin);
    }
  };

  return (
    <div style={styles.loginWrap}>
      <div style={styles.loginTopRow}>
        <div style={styles.logo}>
          <span style={styles.logoMark}>VR</span>
          <span style={styles.logoWordSmall}>Venkataramana Vegetables</span>
        </div>
        <LangToggle lang={lang} setLang={setLang} />
      </div>

      <div style={styles.loginCard}>
        <h2 style={styles.loginTitle}>{t.loginWelcome}</h2>
        <p style={styles.loginSub}>{t.loginSub}</p>

        <div style={styles.loginTabs}>
          <button 
            style={{ ...styles.loginTab, ...(tab === "customer" ? styles.loginTabActive : {}), ...(hoveredTab === "customer" ? styles.loginTabHover : {}) }} 
            onClick={() => { setTab("customer"); setError(""); setMode("login"); }}
            onMouseEnter={() => setHoveredTab("customer")}
            onMouseLeave={() => setHoveredTab(null)}
          >
            {t.customerTab}
          </button>
          <button 
            style={{ ...styles.loginTab, ...(tab === "owner" ? styles.loginTabActive : {}), ...(hoveredTab === "owner" ? styles.loginTabHover : {}) }} 
            onClick={() => { setTab("owner"); setError(""); }}
            onMouseEnter={() => setHoveredTab("owner")}
            onMouseLeave={() => setHoveredTab(null)}
          >
            {t.ownerTab}
          </button>
        </div>

        {tab === "customer" && mode !== "forgot" && (
          <form style={styles.loginForm} key={mode} onSubmit={(e) => { e.preventDefault(); if (canContinueCustomer && !loading) submitCustomer(); }}>
            {mode === "signup" && (
              <>
                <label htmlFor="customerName" style={styles.inputLabel}><User size={13} /> {t.nameLabel}</label>
                <input id="customerName" style={styles.textInput} placeholder={t.namePh} value={name} onChange={(e) => setName(e.target.value)} />
              </>
            )}
            
            <label htmlFor="customerPhone" style={styles.inputLabel}><Phone size={13} /> {t.phoneLabel}</label>
            <input id="customerPhone" style={styles.textInput} placeholder={t.phonePh} value={phone} maxLength={10} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} />
            
            <label htmlFor="customerPassword" style={styles.inputLabel}><KeyRound size={13} /> Password</label>
            <PasswordField id="customerPassword" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" t={t} />
            {mode === "signup" && <PasswordStrengthHints password={password} t={t} />}

            {mode === "login" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                <label style={styles.checkboxRow}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  {t.rememberMe}
                </label>
                <button
                  type="button"
                  style={{ ...styles.linkBtn, fontSize: 12.5 }}
                  onClick={enterForgotMode}
                >
                  {t.forgotPassword}
                </button>
              </div>
            )}

            {error && <p style={styles.errorText} key={error}>{error}</p>}
            
            <button 
              type="submit"
              style={{ ...styles.primaryBtn, ...(hoveredPrimaryBtn ? styles.primaryBtnHover : {}) }} 
              disabled={!canContinueCustomer || loading} 
              onMouseEnter={() => setHoveredPrimaryBtn(true)}
              onMouseLeave={() => setHoveredPrimaryBtn(false)}
            >
              {loading && <span style={styles.loginSpinner} />}
              {loading ? "Please wait..." : (mode === "signup" ? "Sign Up" : "Sign In")}
            </button>
            
            <div style={{ ...styles.otpFooterRow, marginTop: 16, textAlign: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                {mode === "signup" ? "Already have an account?" : "Don't have an account?"}
              </span>
              <button 
                type="button"
                style={{ ...styles.linkBtn, ...(hoveredLinkBtn ? styles.linkBtnHover : {}) }} 
                onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setError(""); }}
                onMouseEnter={() => setHoveredLinkBtn(true)}
                onMouseLeave={() => setHoveredLinkBtn(false)}
              >
                {mode === "signup" ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </form>
        )}

        {tab === "customer" && mode === "forgot" && (
          <div style={styles.loginForm} key={`forgot-${resetStep}`}>
            {resetStep === "request" && (
              <>
                <label style={styles.inputLabel}><Phone size={13} /> {t.resetPhoneLabel}</label>
                <input
                  style={styles.textInput}
                  placeholder={t.phonePh}
                  type="tel"
                  maxLength={10}
                  value={resetPhone}
                  onChange={(e) => setResetPhone(e.target.value.replace(/\D/g, ""))}
                />
                {resetError && <p style={styles.errorText} key={resetError}>{resetError}</p>}
                <button
                  style={{ ...styles.primaryBtn, ...(hoveredPrimaryBtn ? styles.primaryBtnHover : {}) }}
                  disabled={!/^\d{10}$/.test(resetPhone) || resetLoading}
                  onClick={requestResetCode}
                  onMouseEnter={() => setHoveredPrimaryBtn(true)}
                  onMouseLeave={() => setHoveredPrimaryBtn(false)}
                >
                  {resetLoading && <span style={styles.loginSpinner} />}
                  {resetLoading ? "Please wait..." : t.sendResetCodeBtn}
                </button>
              </>
            )}

            {resetStep === "verify" && (
              <>
                {devCode && (
                  <p style={{ fontSize: 12.5, color: "var(--ink-soft)", background: "rgba(40,80,47,0.06)", padding: "8px 10px", borderRadius: 8, marginTop: 4 }}>
                    {t.demoResetNote} <strong>{devCode}</strong>
                  </p>
                )}
                <label style={styles.inputLabel}><KeyRound size={13} /> {t.resetCodeLabel}</label>
                <input
                  style={styles.textInput}
                  placeholder={t.resetCodePh}
                  value={resetCode}
                  maxLength={4}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
                />
                <label style={styles.inputLabel}><KeyRound size={13} /> {t.newPasswordLabel}</label>
                <PasswordField value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t.newPasswordPh} t={t} />
                <PasswordStrengthHints password={newPassword} t={t} />

                {resetError && <p style={styles.errorText} key={resetError}>{resetError}</p>}
                <button
                  style={{ ...styles.primaryBtn, ...(hoveredPrimaryBtn ? styles.primaryBtnHover : {}) }}
                  disabled={!/^\d{4}$/.test(resetCode) || !isStrongPassword(newPassword) || resetLoading}
                  onClick={submitReset}
                  onMouseEnter={() => setHoveredPrimaryBtn(true)}
                  onMouseLeave={() => setHoveredPrimaryBtn(false)}
                >
                  {resetLoading && <span style={styles.loginSpinner} />}
                  {resetLoading ? "Please wait..." : t.resetPasswordBtn}
                </button>
                <div style={{ textAlign: "center", marginTop: 10 }}>
                  <button style={{ ...styles.linkBtn, fontSize: 12.5 }} onClick={requestResetCode} disabled={resetLoading}>
                    {t.resendResetCode}
                  </button>
                </div>
              </>
            )}

            {resetStep === "done" && (
              <p style={{ fontSize: 14, color: "var(--leaf-deep)", fontWeight: 600, textAlign: "center", padding: "12px 0", animation: "scaleIn 0.4s ease" }}>
                {t.resetPasswordSuccess}
              </p>
            )}

            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button style={{ ...styles.linkBtn, fontSize: 12.5 }} onClick={backToLoginMode}>
                &larr; {t.backToLogin}
              </button>
            </div>
          </div>
        )}

        {tab === "owner" && (
          <div style={styles.loginForm} key="owner">
            <label style={styles.inputLabel}><User size={13} /> {t.ownerUserPh}</label>
            <input style={styles.textInput} placeholder={t.ownerUserPh} value={ownerUser} onChange={(e) => setOwnerUser(e.target.value)} />
            <label style={styles.inputLabel}><KeyRound size={13} /> {t.ownerPassPh}</label>
            <PasswordField value={ownerPass} onChange={(e) => setOwnerPass(e.target.value)} placeholder={t.ownerPassPh} t={t} />
            {error && <p style={styles.errorText} key={error}>{error}</p>}
            <button 
              style={{ ...styles.primaryBtn, ...(hoveredPrimaryBtn ? styles.primaryBtnHover : {}) }} 
              disabled={!ownerUser || !ownerPass || checkingOwner} 
              onClick={submitOwner}
              onMouseEnter={() => setHoveredPrimaryBtn(true)}
              onMouseLeave={() => setHoveredPrimaryBtn(false)}
            >
              {checkingOwner && <span style={styles.loginSpinner} />}
              {checkingOwner ? "…" : t.ownerLoginBtn}
            </button>
          </div>
        )}
      </div>

      <ContactBar t={t} />
    </div>
  );
}
