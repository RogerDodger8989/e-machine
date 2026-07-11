import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import { createBackupSnapshot } from "@/lib/backup";
import { resolveDbPath } from "@/lib/dbPath";

export const runtime = "nodejs";

export async function GET() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const tempPath = `${resolveDbPath()}.download-${Date.now()}`;

  const target = await createBackupSnapshot(tempPath);
  const buffer = await fs.readFile(target);
  await fs.unlink(target).catch(() => {});

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="e-machines-backup-${stamp}.db"`,
    },
  });
}
