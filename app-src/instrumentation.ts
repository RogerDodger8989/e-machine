export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { runDailyBackupIfNeeded } = await import("@/lib/backup");

  const runBackupCheck = () => {
    runDailyBackupIfNeeded().catch((err) => {
      console.error("[backup] daglig snapshot misslyckades:", err);
    });
  };

  // Catch-up direkt vid programstart...
  runBackupCheck();

  // ...och sedan en återkommande koll en gång i timmen så länge processen
  // lever. Appen kör inte som en riktig bakgrundstjänst som startar om varje
  // dygn (launcher.vbs startar bara servern om den inte redan kör) — utan
  // detta skulle ett datumskifte aldrig upptäckas om datorn lämnas påslagen
  // över natten, och backupen skulle tyst sluta ta nya snapshots.
  setInterval(runBackupCheck, 60 * 60 * 1000);

  // Servicepåminnelser skickas inte längre automatiskt — de granskas och
  // skickas manuellt under Inställningar → Servicepåminnelser.
}
