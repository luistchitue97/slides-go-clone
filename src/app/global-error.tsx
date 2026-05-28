"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#04061a",
          color: "#f5f6f8",
          fontFamily: "system-ui, sans-serif",
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <p style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", opacity: 0.7 }}>
            Application error
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 600, marginTop: 8 }}>
            DeckForge ran into a problem.
          </h1>
          <p style={{ marginTop: 12, opacity: 0.8 }}>
            We&apos;ve been notified. {error.digest ? `Reference: ${error.digest}` : null}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 20,
              background: "white",
              color: "#11162a",
              padding: "10px 16px",
              borderRadius: 10,
              border: 0,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
