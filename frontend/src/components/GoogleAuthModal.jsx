import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import toast from "react-hot-toast";

export default function GoogleAuthModal({ isOpen, onClose, mode = "login" }) {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("Nanda Kumar");
  const [email, setEmail] = useState("nanda.kumar@gmail.com");
  const [avatar, setAvatar] = useState("https://lh3.googleusercontent.com/a/default-user=s96-c");
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [savingCreds, setSavingCreds] = useState(false);

  const handleSaveCredentials = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      toast.error("Please enter both Google Client ID and Client Secret", { position: "top-center" });
      return;
    }
    try {
      setSavingCreds(true);
      await authService.saveGoogleCredentials({ clientId: clientId.trim(), clientSecret: clientSecret.trim() });
      toast.success("Google OAuth credentials saved! Launching Google login...", { position: "top-center" });
      const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      window.location.href = `${backendUrl}/auth/google`;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save Google credentials", { position: "top-center" });
    } finally {
      setSavingCreds(false);
    }
  };

  if (!isOpen) return null;

  const titleText = mode === "signup" ? "Sign up with Google" : "Sign in with Google";

  const handleContinueWithAccount = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid Google email address", { position: "top-center" });
      return;
    }

    try {
      setLoading(true);
      await googleLogin({
        profile: {
          googleId: `google_${Date.now()}`,
          name: name.trim() || "Google User",
          email: email.trim().toLowerCase(),
          avatar: avatar || "https://lh3.googleusercontent.com/a/default-user=s96-c",
        },
      });

      toast.success(`Signed in as ${name || email}! Saved to MongoDB Compass.`, { position: "top-center" });
      onClose();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Google sign in error:", err);
      toast.error(err?.response?.data?.message || "Failed to authenticate with Google", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  const handleLiveGoogleOAuth = () => {
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(6px)",
        padding: "var(--space-4)",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
          padding: "var(--space-6)",
          position: "relative",
          animation: "fadeIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            fontSize: "20px",
            color: "var(--color-text-secondary)",
            cursor: "pointer",
            lineHeight: 1,
            padding: "4px",
          }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Google Header */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-5)" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              marginBottom: "var(--space-3)",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
          </div>
          <h3 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-bold)", margin: "0 0 4px 0", color: "#1e293b" }}>
            {titleText}
          </h3>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", margin: 0 }}>
            Choose your Google account to continue to <strong>RozgaarAI</strong>
          </p>
        </div>

        {/* Account Details Form */}
        <form onSubmit={handleContinueWithAccount} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div
            style={{
              border: "1.5px solid #e2e8f0",
              borderRadius: "12px",
              padding: "var(--space-3)",
              background: "#f8fafc",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4285F4, #34A853)",
                color: "#fff",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                flexShrink: 0,
              }}
            >
              {(name || "G").charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "var(--text-xs)", color: "#64748b", fontWeight: "var(--weight-medium)" }}>Active Selection</div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-bold)", color: "#0f172a", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {name || "Google User"}
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "#475569", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                {email}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--color-text-secondary)" }}>
              Google Display Name
            </label>
            <input
              className="input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Full Name"
              required
              style={{ fontSize: "var(--text-sm)", padding: "8px 12px" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--color-text-secondary)" }}>
              Google Email Address (Saved to MongoDB Compass)
            </label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@gmail.com"
              required
              style={{ fontSize: "var(--text-sm)", padding: "8px 12px" }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "var(--space-2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "#1a73e8",
              borderColor: "#1a73e8",
              height: "42px",
              fontWeight: "var(--weight-medium)",
            }}
          >
            {loading ? "Authenticating..." : `Continue as ${name.split(" ")[0] || "User"}`}
          </button>
        </form>

        {/* Live OAuth Option Accordion */}
        <div style={{ marginTop: "var(--space-4)", paddingTop: "var(--space-3)", borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              background: "none",
              border: "none",
              fontSize: "var(--text-xs)",
              color: "#64748b",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {showAdvanced ? "▲ Hide Google Cloud OAuth options" : "▼ Using Google Cloud Console OAuth?"}
          </button>

          {showAdvanced && (
            <div
              style={{
                marginTop: "var(--space-3)",
                padding: "var(--space-3)",
                background: "#f8fafc",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                textAlign: "left",
                fontSize: "var(--text-xs)",
                color: "#475569",
              }}
            >
              <p style={{ margin: "0 0 8px 0", fontWeight: 600, color: "#1e293b" }}>
                Connect Live accounts.google.com:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
                <input
                  className="input"
                  type="text"
                  placeholder="Paste GOOGLE_CLIENT_ID (.apps.googleusercontent.com)"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  style={{ fontSize: "11px", padding: "6px 8px" }}
                />
                <input
                  className="input"
                  type="password"
                  placeholder="Paste GOOGLE_CLIENT_SECRET"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  style={{ fontSize: "11px", padding: "6px 8px" }}
                />
              </div>

              <button
                type="button"
                className="btn btn-primary"
                disabled={savingCreds}
                onClick={handleSaveCredentials}
                style={{ width: "100%", fontSize: "var(--text-xs)", padding: "7px 10px", marginBottom: "6px" }}
              >
                {savingCreds ? "Saving credentials…" : "Save & Launch accounts.google.com"}
              </button>

              <div style={{ fontSize: "10px", color: "#64748b", lineHeight: 1.4 }}>
                ℹ️ Authorized redirect URI in Google Cloud Console: <br />
                <code style={{ background: "#e2e8f0", padding: "1px 4px", borderRadius: "3px" }}>
                  http://localhost:5000/api/auth/google/callback
                </code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
