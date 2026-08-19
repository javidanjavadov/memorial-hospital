"use client"

/**
 * Last-resort boundary for errors thrown inside the root layout itself. It has
 * to render its own <html>/<body> because the layout that normally provides
 * them is what failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Nothing else can report this — the app shell itself failed.
  console.error("Global error:", error)

  return (
    <html lang="az">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          margin: 0,
          color: "#18383E",
          background: "#ffffff",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
            Sayt müvəqqəti əlçatmazdır
          </h1>
          <p style={{ marginBottom: "1.5rem", color: "#5a7a7e" }}>
            Zəhmət olmasa bir azdan yenidən cəhd edin. Təcili hallarda:{" "}
            <a href="tel:+994557101050" style={{ color: "#267B8D" }}>
              +994 55 710 10 50
            </a>
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              border: "none",
              background: "#267B8D",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Yenidən cəhd et
          </button>
        </div>
      </body>
    </html>
  )
}
