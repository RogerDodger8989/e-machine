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
          <CardTitle>Kampanjblad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Skapa flera olika kampanjblad (t.ex. hämt-/lämnerbjudande, säsongskampanjer) — skrivs ut
            per maskin, eller mailas till en enskild kund eller flera på en gång.
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/settings/campaign-sheet">Hantera kampanjblad</Link>} />
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
          <CardTitle>Utskick</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Konfigurera 46elks (SMS) och Mailercloud (e-post) för att kunna skicka
            servicepåminnelser och kampanjer.
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/settings/messaging">Konfigurera utskick</Link>} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Servicepåminnelser</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Granska vilka kunder som är aktuella för en påminnelse just nu, välj vilka
            och vilken kanal (SMS/e-post) innan något skickas — inget skickas automatiskt.
          </p>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/settings/service-reminders">Visa aktuella påminnelser</Link>}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kampanjer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Skicka ett eget manuellt utskick (t.ex. en säsongskampanj) till valda kunder
            som lämnat samtycke.
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/settings/campaigns">Skicka kampanj</Link>} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kategorier</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Hantera kategorier för maskinmodeller (t.ex. &quot;Gräsklippare&quot;,
            &quot;Motorsåg&quot;) — lägg till, döp om eller ta bort.
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/settings/categories">Hantera kategorier</Link>} />
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
