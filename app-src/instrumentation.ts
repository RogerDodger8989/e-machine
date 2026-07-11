export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { runDailyBackupIfNeeded } = await import("@/lib/backup");

  // Catch-up: appen kör inte som bakgrundstjänst, så vi säkerställer minst en
  // backup-snapshot per dag första gången programmet öppnas den dagen.
  runDailyBackupIfNeeded().catch((err) => {
    console.error("[backup] daglig snapshot misslyckades:", err);
  });

  // Servicepåminnelser skickas inte längre automatiskt — de granskas och
  // skickas manuellt under Inställningar → Servicepåminnelser.
}
