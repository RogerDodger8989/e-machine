"use client";

/**
 * Fångar fel som kastas i root-layouten själv (t.ex. om ett hälsokontroll-
 * anrop som backup-varningen eller räknaren för misslyckade utskick skulle
 * krascha) — annars tar ett sådant fel ner HELA appen med Next.js generiska
 * felsida. Måste rendera sina egna <html>/<body>-taggar eftersom den
 * ersätter root-layouten helt när den aktiveras.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="sv">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "3rem 1.5rem" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Något gick fel</h1>
          <p style={{ color: "#666", fontSize: "0.875rem", marginTop: "0.5rem" }}>
            Ett oväntat fel inträffade när appen startade. Ingen data har gått förlorad —
            försök igen.
          </p>
          {error.message && (
            <p
              style={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                background: "#f3f3f3",
                borderRadius: 6,
                padding: "0.5rem",
                marginTop: "1rem",
                wordBreak: "break-word",
              }}
            >
              {error.message}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.5rem 1rem",
              borderRadius: 8,
              border: "none",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Försök igen
          </button>
        </div>
      </body>
    </html>
  );
}
