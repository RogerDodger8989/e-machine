import fs from "node:fs/promises";
import path from "node:path";
import Database from "better-sqlite3";
import { prisma, reconnectDb, disconnectDb } from "@/lib/db";
import { resolveDbPath } from "@/lib/dbPath";
import { getSetting, setSetting, deleteSetting } from "@/lib/settings";

const KEEP_DAYS = 30;
const EXTERNAL_DIR_KEY = "backupExternalDir";
const EXTERNAL_STATUS_KEY = "backupExternalStatus";

export interface ExternalBackupStatus {
  ok: boolean;
  at: string; // ISO
  error?: string;
}

function todayStamp(date = new Date()): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

export function getBackupDir(): string {
  const dbDir = path.dirname(resolveDbPath());
  return path.join(dbDir, "backups");
}

async function pruneOldBackups(dir: string): Promise<void> {
  const files = await fs.readdir(dir).catch(() => [] as string[]);
  const cutoff = Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000;
  for (const file of files) {
    if (!file.startsWith("e-machines-") || !file.endsWith(".db")) continue;
    const full = path.join(dir, file);
    const stat = await fs.stat(full).catch(() => null);
    if (stat && stat.mtimeMs < cutoff) await fs.unlink(full).catch(() => {});
  }
}

/** Skapar en konsekvent ögonblicksbild av databasen via SQLite:s `VACUUM INTO`,
 * som kan köras säkert även medan appen används (ingen exklusiv låsning krävs). */
export async function createBackupSnapshot(destPath?: string): Promise<string> {
  const dir = getBackupDir();
  await fs.mkdir(dir, { recursive: true });
  const target = destPath ?? path.join(dir, `e-machines-${todayStamp()}.db`);

  await fs.unlink(target).catch(() => {}); // VACUUM INTO kräver att målfilen inte redan finns
  await prisma.$executeRawUnsafe("VACUUM INTO ?", target);

  return target;
}

/** Sökväg till en extern backupplats (t.ex. en nätverksenhet) som användaren
 * kan ställa in under Inställningar → Backup. `null` betyder avstängt. */
export async function getExternalBackupDir(): Promise<string | null> {
  return getSetting<string>(EXTERNAL_DIR_KEY);
}

export async function setExternalBackupDir(dir: string | null): Promise<void> {
  if (dir) await setSetting(EXTERNAL_DIR_KEY, dir);
  else {
    await deleteSetting(EXTERNAL_DIR_KEY);
    await deleteSetting(EXTERNAL_STATUS_KEY);
  }
}

export async function getExternalBackupStatus(): Promise<ExternalBackupStatus | null> {
  return getSetting<ExternalBackupStatus>(EXTERNAL_STATUS_KEY);
}

/** Testar att katalogen går att skapa och skriva till — körs innan en ny
 * plats sparas, så ett stavfel eller en nätverksenhet utan behörighet upptäcks
 * direkt istället för att tysta misslyckas nästa natt. */
export async function testExternalBackupDir(dir: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await fs.mkdir(dir, { recursive: true });
    const testFile = path.join(dir, ".e-machines-write-test");
    await fs.writeFile(testFile, "test");
    await fs.unlink(testFile);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Kopierar en redan skapad snapshot till den externa backupplatsen om en är
 * konfigurerad. Fel (t.ex. nätverksenhet otillgänglig) loggas som status men
 * kastas inte vidare — den lokala backupen ska inte räknas som misslyckad
 * bara för att nätverksplatsen är nere just då. */
async function copyToExternalDestination(sourcePath: string): Promise<void> {
  const externalDir = await getExternalBackupDir();
  if (!externalDir) return;

  try {
    await fs.mkdir(externalDir, { recursive: true });
    await fs.copyFile(sourcePath, path.join(externalDir, path.basename(sourcePath)));
    await setSetting(EXTERNAL_STATUS_KEY, {
      ok: true,
      at: new Date().toISOString(),
    } satisfies ExternalBackupStatus);
  } catch (e) {
    await setSetting(EXTERNAL_STATUS_KEY, {
      ok: false,
      at: new Date().toISOString(),
      error: (e as Error).message,
    } satisfies ExternalBackupStatus);
  }
}

/** Körs vid varje programstart (samma "catch-up"-princip som påminnelserna) —
 * appen kör inte som bakgrundstjänst, så vi säkerställer en backup per dag
 * första gången programmet öppnas den dagen. */
export async function runDailyBackupIfNeeded(): Promise<void> {
  const dir = getBackupDir();
  const todaysFile = path.join(dir, `e-machines-${todayStamp()}.db`);
  const exists = await fs
    .stat(todaysFile)
    .then(() => true)
    .catch(() => false);
  if (!exists) {
    await createBackupSnapshot(todaysFile);
    await pruneOldBackups(dir);
  }

  await copyToExternalDestination(todaysFile);
}

/** Manuell "kör nu"-knapp i inställningarna — skapar en färsk snapshot direkt
 * istället för att vänta på nästa programstart, och kopierar den till den
 * externa platsen om en är konfigurerad. */
export async function runBackupNow(): Promise<{ localPath: string; external: ExternalBackupStatus | null }> {
  const dir = getBackupDir();
  const todaysFile = path.join(dir, `e-machines-${todayStamp()}.db`);
  await createBackupSnapshot(todaysFile);
  await pruneOldBackups(dir);
  await copyToExternalDestination(todaysFile);
  return { localPath: todaysFile, external: await getExternalBackupStatus() };
}

export interface BackupFileInfo {
  filename: string;
  sizeBytes: number;
  createdAt: Date;
}

export async function listBackupsIn(dir: string): Promise<BackupFileInfo[]> {
  const files = await fs.readdir(dir).catch(() => [] as string[]);
  const infos: BackupFileInfo[] = [];
  for (const filename of files) {
    if (!filename.startsWith("e-machines-") || !filename.endsWith(".db")) continue;
    const stat = await fs.stat(path.join(dir, filename)).catch(() => null);
    if (stat) infos.push({ filename, sizeBytes: stat.size, createdAt: stat.mtime });
  }
  return infos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function listBackups(): Promise<BackupFileInfo[]> {
  return listBackupsIn(getBackupDir());
}

export async function listExternalBackups(): Promise<BackupFileInfo[]> {
  const dir = await getExternalBackupDir();
  if (!dir) return [];
  return listBackupsIn(dir);
}

export interface BackupHealth {
  localWarning: string | null;
  externalWarning: string | null;
}

function daysAgoLabel(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "idag";
  if (days === 1) return "1 dag sedan";
  return `${days} dagar sedan`;
}

/**
 * Kontrollerar om backuperna faktiskt görs som de ska — tänkt att visas som en
 * varning i gränssnittet istället för att upptäckas först när man behöver
 * återställa. Ett "ok"-status-fält från förra körningen räcker inte ensamt,
 * eftersom appen bara kör vid programstart: om den inte öppnats på flera
 * dagar syns det inte i status-fältet men backupen är ändå för gammal.
 */
export async function getBackupHealth(): Promise<BackupHealth> {
  const today = todayStamp();

  const localBackups = await listBackups();
  const latestLocal = localBackups[0];
  let localWarning: string | null = null;
  if (!latestLocal) {
    localWarning = "Ingen lokal backup har skapats ännu.";
  } else if (todayStamp(latestLocal.createdAt) !== today) {
    localWarning = `Senaste lokala backupen är från ${latestLocal.createdAt.toLocaleDateString("sv-SE")} (${daysAgoLabel(latestLocal.createdAt)}).`;
  }

  const externalDir = await getExternalBackupDir();
  let externalWarning: string | null = null;
  if (externalDir) {
    const status = await getExternalBackupStatus();
    if (!status) {
      externalWarning = "Extern backupplats är sparad men ingen kopiering har körts ännu.";
    } else if (!status.ok) {
      externalWarning = `Senaste kopieringen till den externa platsen misslyckades: ${status.error}`;
    } else if (todayStamp(new Date(status.at)) !== today) {
      externalWarning = `Senaste lyckade kopieringen till den externa platsen var ${new Date(status.at).toLocaleDateString("sv-SE")} (${daysAgoLabel(new Date(status.at))}).`;
    }
  }

  return { localWarning, externalWarning };
}

function validateSqliteFile(filePath: string): void {
  const db = new Database(filePath, { readonly: true });
  try {
    const integrity = db.prepare("PRAGMA integrity_check").get() as { integrity_check: string };
    if (integrity.integrity_check !== "ok") {
      throw new Error("Filen verkar vara skadad (integrity_check misslyckades)");
    }
    const hasCustomersTable = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='customers'")
      .get();
    if (!hasCustomersTable) {
      throw new Error("Filen verkar inte vara en giltig e-Machines-databas");
    }
  } finally {
    db.close();
  }
}

/**
 * Ersätter den körande databasen med en uppladdad backupfil. Validerar filen
 * innan något skrivs över, säkerhetskopierar den nuvarande databasen (ifall
 * återställningen behöver ångras manuellt), och kopplar om Prisma-anslutningen
 * mot den nya filen efteråt.
 */
export async function restoreFromUpload(buffer: Buffer): Promise<void> {
  const dbPath = resolveDbPath();
  const tempPath = `${dbPath}.incoming-${Date.now()}`;
  await fs.writeFile(tempPath, buffer);

  try {
    validateSqliteFile(tempPath);
  } catch (e) {
    await fs.unlink(tempPath).catch(() => {});
    throw e;
  }

  await disconnectDb();
  try {
    const safetyPath = `${dbPath}.before-restore-${Date.now()}`;
    await fs.copyFile(dbPath, safetyPath).catch(() => {});
    await fs.rename(tempPath, dbPath);
  } finally {
    await reconnectDb();
  }
}
