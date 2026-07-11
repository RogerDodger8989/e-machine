"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  updateBackupDestination,
  triggerBackupNow,
  type RunBackupNowResult,
} from "@/app/settings/backup/actions";
import type { ExternalBackupStatus, BackupFileInfo } from "@/lib/backup";

function formatBytes(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export function BackupDestinationForm({
  currentDir,
  status,
  recentBackups,
}: {
  currentDir: string | null;
  status: ExternalBackupStatus | null;
  recentBackups: BackupFileInfo[];
}) {
  const [value, setValue] = useState(currentDir ?? "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [lastRun, setLastRun] = useState<RunBackupNowResult | null>(null);

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const form = new FormData();
      form.set("externalDir", value);
      const res = await updateBackupDestination(form);
      setMessage({ ok: res.ok, text: res.message });
    });
  }

  function handleRunNow() {
    setMessage(null);
    startTransition(async () => {
      const res = await triggerBackupNow();
      setLastRun(res);
    });
  }

  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted-foreground">
        Ange en mapp dit en kopia av dagens backup sparas automatiskt varje dag — t.ex. en
        nätverksenhet eller mappad enhet (t.ex. <code>\\SERVER\Backup\e-Machines</code> eller{" "}
        <code>Z:\Backup</code>). Om datorn kraschar kan du återställa från den kopian på en ny
        maskin under &quot;Återställ från fil&quot; nedan. Lämna fältet tomt för att stänga av.
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="externalDir">Extern backupplats</Label>
        <div className="flex gap-2">
          <Input
            id="externalDir"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="\\SERVER\Backup\e-Machines"
            className="flex-1"
          />
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? "Sparar…" : "Spara"}
          </Button>
        </div>
      </div>

      {message && (
        <p className={message.ok ? "text-sm" : "text-sm text-destructive"}>{message.text}</p>
      )}

      {currentDir && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Senaste kopiering till {currentDir}:</span>
          {status ? (
            <Badge variant={status.ok ? "default" : "destructive"}>
              {status.ok ? `OK, ${new Date(status.at).toLocaleString("sv-SE")}` : `Misslyckades: ${status.error}`}
            </Badge>
          ) : (
            <Badge variant="secondary">Ingen kopiering ännu</Badge>
          )}
        </div>
      )}

      <Button type="button" variant="outline" onClick={handleRunNow} disabled={isPending}>
        {isPending ? "Kör backup…" : "Kör backup nu"}
      </Button>
      {lastRun && (
        <p className="text-muted-foreground">
          Ny lokal snapshot skapad.{" "}
          {lastRun.external
            ? lastRun.external.ok
              ? "Kopierad till extern plats."
              : `Kunde inte kopieras till extern plats: ${lastRun.external.error}`
            : ""}
        </p>
      )}

      {currentDir && (
        <div className="space-y-1.5 pt-2">
          <Label>Senaste backuperna på den externa platsen</Label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fil</TableHead>
                <TableHead>Storlek</TableHead>
                <TableHead>Skapad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBackups.map((b) => (
                <TableRow key={b.filename}>
                  <TableCell>{b.filename}</TableCell>
                  <TableCell>{formatBytes(b.sizeBytes)}</TableCell>
                  <TableCell>{b.createdAt.toLocaleString("sv-SE")}</TableCell>
                </TableRow>
              ))}
              {recentBackups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    Inga backuper hittades på den externa platsen ännu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
