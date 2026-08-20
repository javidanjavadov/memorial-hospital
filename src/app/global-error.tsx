"use client"

/**
 * Last-resort boundary for errors thrown inside the root layout itself. It has
 * to render its own <html>/<body> because the layout that normally provides
 * them is what failed.
 */
/*
 * The only text on the site that does not come from the dictionary.
 *
 * This boundary replaces the root layout, so the provider that carries the
 * dictionary is exactly what has failed — reading it here would throw inside
 * the handler for a throw. Four short strings, read straight off the locale
 * cookie, are the price of that.
 */
const TEXT = {
  az: {
    title: "Sayt müvəqqəti əlçatmazdır",
    body: "Zəhmət olmasa bir azdan yenidən cəhd edin. Təcili hallarda:",
    retry: "Yenidən cəhd et",
  },
  ru: {
    title: "Сайт временно недоступен",
    body: "Пожалуйста, попробуйте позже. В экстренных случаях:",
    retry: "Повторить",
  },
  en: {
    title: "The site is temporarily unavailable",
    body: "Please try again shortly. In an emergency:",
    retry: "Try again",
  },
  tr: {
    title: "Site geçici olarak kullanılamıyor",
    body: "Lütfen biraz sonra tekrar deneyin. Acil durumlarda:",
    retry: "Tekrar dene",
  },
} as const

type GlobalLocale = keyof typeof TEXT

const readLocale = (): GlobalLocale => {
  if (typeof document === "undefined") return "az"
  const match = document.cookie.match(/memorial-locale=(az|ru|en|tr)/)
  return (match?.[1] as GlobalLocale) ?? "az"
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Nothing else can report this — the app shell itself failed.
  console.error("Global error:", error)

  const locale = readLocale()
  const text = TEXT[locale]

  return (
    <html lang={locale}>
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
            {text.title}
          </h1>
          <p style={{ marginBottom: "1.5rem", color: "#5a7a7e" }}>
            {text.body}{" "}
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
            {text.retry}
          </button>
        </div>
      </body>
    </html>
  )
}
