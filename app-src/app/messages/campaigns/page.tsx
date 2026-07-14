import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CampaignsHubPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Kampanj</h1>
      <p className="text-sm text-muted-foreground">
        Två sätt att nå kunder: en manuell marknadsföringskampanj till valda kunder, eller ett
        kampanjblad (för en specifik maskin, med maskinens uppgifter isatta) som går att skriva
        ut eller maila.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Skicka kampanj</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Skicka ett eget manuellt utskick (t.ex. en säsongskampanj) till valda kunder som
            lämnat samtycke.
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/messages/campaigns/send">Skicka kampanj</Link>} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kampanjblad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Skapa flera olika kampanjblad (t.ex. hämt-/lämnerbjudande, säsongskampanjer) — skrivs
            ut per maskin, eller mailas till en enskild kund eller flera på en gång.
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/messages/campaigns/sheets">Hantera kampanjblad</Link>} />
        </CardContent>
      </Card>
    </div>
  );
}
