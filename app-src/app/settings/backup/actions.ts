"use server";

import { revalidatePath } from "next/cache";
import {
  setExternalBackupDir,
  testExternalBackupDir,
  runBackupNow,
  setAutoBackupEnabled,
  type ExternalBackupStatus,
} from "@/lib/backup";

export interface UpdateBackupDestinationResult {
  ok: boolean;
  message: string;
}

/**
 * Sparar (eller stänger av) en extern backupplats, t.ex. en nätverksenhet.
 * Testar att katalogen går att skriva till innan den sparas, så ett stavfel
 * eller en otillgänglig nätverksväg upptäcks direkt i inställningarna
 * istället för att tysta misslyckas i nästa automatiska backup.
 */
export async function updateBackupDestination(
  formData: FormData
): Promise<UpdateBackupDestinationResult> {
  const raw = String(formData.get("externalDir") ?? "").trim();

  if (!raw) {
    await setExternalBackupDir(null);
    revalidatePath("/settings/backup");
    return { ok: true, message: "Extern backupplats avstängd." };
  }

  const test = await testExternalBackupDir(raw);
  if (!test.ok) {
    return { ok: false, message: `Kunde inte skriva till "${raw}": ${test.error}` };
  }

  await setExternalBackupDir(raw);
  revalidatePath("/settings/backup");
  return { ok: true, message: "Extern backupplats sparad. En kopia sparas dit varje dag." };
}

export interface RunBackupNowResult {
  localPath: string;
  external: ExternalBackupStatus | null;
}

export async function triggerBackupNow(): Promise<RunBackupNowResult> {
  const result = await runBackupNow();
  revalidatePath("/settings/backup");
  return result;
}

export async function updateAutoBackupEnabled(enabled: boolean): Promise<void> {
  await setAutoBackupEnabled(enabled);
  revalidatePath("/settings/backup");
  revalidatePath("/", "layout");
}
