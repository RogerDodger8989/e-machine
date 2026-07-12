import {
  listBackups,
  listExternalBackups,
  getBackupDir,
  getExternalBackupDir,
  getExternalBackupStatus,
  getBackupHealth,
  isAutoBackupEnabled,
} from "@/lib/backup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RestoreBackupForm } from "@/components/restore-backup-form";
import { BackupDestinationForm } from "@/components/backup-destination-form";
import { BackupWarningBanner } from "@/components/backup-warning-banner";
import { AutoBackupToggle } from "@/components/auto-backup-toggle";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const dynamic = "force-dynamic";

function formatBytes(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default async function BackupSettingsPage() {
  const [backups, externalDir, externalStatus, externalBackups, health, autoEnabled] = await Promise.all([
    listBackups(),
    getExternalBackupDir(),
    getExternalBackupStatus(),
    listExternalBackups(),
    getBackupHealth(),
    isAutoBackupEnabled(),
  ]);

  const warnings = [health.localWarning, health.externalWarning].filter((w): w is string => w !== null);

  return (
    <div className="max-w-2xl space-y-4">
      <Breadcrumbs
        items={[
          { label: "Inställningar", href: "/settings" },
          { label: "Backup & återställning", href: "/settings/backup" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Backup & återställning</h1>

      <BackupWarningBanner warnings={warnings} />

      <Card>
        <CardHeader>
          <CardTitle>Ladda ner backup nu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Laddar ner en färsk kopia av hela databasen direkt till din dator — spara den
            var du vill (lokal disk eller nätverksenhet).
          </p>
          <Button nativeButton={false} render={<a href="/api/backup/export">Ladda ner backup</a>} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automatiska backuper</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <AutoBackupToggle enabled={autoEnabled} />
          <p className="text-muted-foreground">
            {autoEnabled ? (
              <>
                En ny snapshot tas automatiskt en gång per dag (kollas varje timme medan
                programmet är igång, så det upptäcks även om datorn lämnas påslagen över
                natten), sparas i <code>{getBackupDir()}</code> och behålls i 30 dagar.
                {externalDir && " En kopia sparas även på den externa backupplatsen nedan."}
              </>
            ) : (
              "Automatisk backup är avstängd — inga nya snapshots skapas av sig själva. Använd \"Ladda ner backup\" ovan för en manuell kopia."
            )}
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fil</TableHead>
                <TableHead>Storlek</TableHead>
                <TableHead>Skapad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((b) => (
                <TableRow key={b.filename}>
                  <TableCell>{b.filename}</TableCell>
                  <TableCell>{formatBytes(b.sizeBytes)}</TableCell>
                  <TableCell>{b.createdAt.toLocaleString("sv-SE")}</TableCell>
                </TableRow>
              ))}
              {backups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                    Inga automatiska backuper ännu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Extern backupplats</CardTitle>
        </CardHeader>
        <CardContent>
          <BackupDestinationForm
            currentDir={externalDir}
            status={externalStatus}
            recentBackups={externalBackups}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Återställ från fil</CardTitle>
        </CardHeader>
        <CardContent>
          <RestoreBackupForm />
        </CardContent>
      </Card>
    </div>
  );
}
