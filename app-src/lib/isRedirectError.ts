/**
 * Next.js signalerar en redirect() från en Server Action genom att kasta ett
 * specialfel vars digest börjar på "NEXT_REDIRECT". Om ett anrop till en
 * sådan action wrappas i try/catch (för att visa egna felmeddelanden, t.ex.
 * dubbletter) måste detta fel kastas vidare — annars avbryts omdirigeringen
 * och den visas felaktigt som ett vanligt fel för användaren.
 */
export function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
