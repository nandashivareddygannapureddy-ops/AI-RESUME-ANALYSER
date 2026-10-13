// src/components/common/LoginPromptModal.jsx
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";

export default function LoginPromptModal({ isOpen, onClose, message = "Please log in to check your ATS score." }) {
  const navigate = useNavigate();

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        padding: "var(--space-4)",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          padding: "var(--space-6)",
          position: "relative",
          textAlign: "center",
          animation: "fadeIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
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

        {/* Lock / ATS Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--color-primary-subtle)",
            border: "2px solid var(--color-primary-muted)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            marginBottom: "var(--space-4)",
          }}
        >
          🔒
        </div>

        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-lg)",
            fontWeight: "var(--weight-bold)",
            color: "var(--color-text-primary)",
            marginBottom: "var(--space-2)",
          }}
        >
          Login to Check ATS Score
        </h3>

        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-secondary)",
            lineHeight: 1.5,
            marginBottom: "var(--space-6)",
          }}
        >
          {message}
        </p>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <button
            className="btn btn-primary"
            style={{ width: "100%", padding: "var(--space-3)", fontSize: "var(--text-sm)" }}
            onClick={() => {
              onClose();
              navigate("/login");
            }}
          >
            Log in to continue
          </button>

          <button
            className="btn btn-secondary"
            style={{ width: "100%", padding: "var(--space-3)", fontSize: "var(--text-sm)" }}
            onClick={() => {
              onClose();
              navigate("/register");
            }}
          >
            Create a new account
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
