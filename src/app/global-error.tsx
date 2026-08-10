"use client";

export default function GlobalError({
  retry,
}: {
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a14", color: "#e5e5ec", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: "640px", padding: "2rem", textAlign: "center" }}>
          <p style={{ fontSize: "3.5rem", margin: 0 }}>⚡</p>
          <h1 style={{ fontSize: "1.5rem", margin: "1.5rem 0 0.5rem" }}>The sphere needs to catch its breath.</h1>
          <p style={{ opacity: 0.7, margin: 0 }}>
            Our anime data source got overwhelmed for a second. Give it a moment and try again.
          </p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 1.75rem",
              border: "none",
              borderRadius: "9999px",
              background: "linear-gradient(90deg, #ff4ecd, #a855f7)",
              color: "#0a0a14",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}