import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getBackupHealth } from "@/lib/backup";
import { BackupWarningBanner } from "@/components/backup-warning-banner";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const health = await getBackupHealth();
  const warnings = [health.localWarning, health.externalWarning].filter((w): w is string => w !== null);

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Inställningar</h1>

      <Card>
        <CardHeader>
          <CardTitle>Företagsuppgifter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Namn, adress, telefon, org.nr och logga — används på utskrivna kampanjblad
            och i utskicksmallar.
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/settings/company">Redigera företagsuppgifter</Link>} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mallar för utskick</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" nativeButton={false} render={<Link href="/settings/templates">Hantera mallar</Link>} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>E-post & SMS-anslutning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Konfigurera 46elks (SMS) och Mailercloud (e-post) för att kunna skicka
            servicepåminnelser och kampanjer. Själva utskicken (kampanjer, kampanjblad,
            servicepåminnelser) sköts under Utskick i huvudmenyn.
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/settings/messaging">Konfigurera anslutning</Link>} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kategorier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Hantera kategorier för maskinmodeller (t.ex. &quot;Gräsklippare&quot;,
            &quot;Motorsåg&quot;, &quot;Cyklar&quot;) — lägg till, döp om eller ta bort. Standard-
            serviceintervall (inkl. första service) sätts också per kategori här.
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/settings/categories">Hantera kategorier</Link>} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tillverkare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Hantera tillverkare (t.ex. &quot;Stiga&quot;, &quot;Stihl&quot;, ett cykelmärke) —
            lägg till, döp om eller ta bort.
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/settings/manufacturers">Hantera tillverkare</Link>} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup & återställning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BackupWarningBanner warnings={warnings} />
          <Button variant="outline" nativeButton={false} render={<Link href="/settings/backup">Hantera backup</Link>} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Importera data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Importera kunder från Crona, maskinägande från Crona, samt registrerade garantiprodukter
            från Stiga och Stihl.
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/settings/import">Importera data</Link>} />
        </CardContent>
      </Card>
    </div>
  );
}
