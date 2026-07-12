import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ImportHubPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <Breadcrumbs items={[{ label: "Inställningar", href: "/settings" }, { label: "Importera data", href: "/settings/import" }]} />
      <h1 className="text-2xl font-semibold">Importera data</h1>
      <p className="text-sm text-muted-foreground">
        Importera från en CSV- eller Excel-fil. Ladda upp filen, koppla dess kolumner till rätt fält och
        förhandsgranska vad som kommer hända innan något sparas. Kan köras återkommande — matchande
        poster uppdateras istället för att dubbleras.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>1. Kunder (Crona)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Importera kundregistret från kassasystemet Crona. Gör detta först — de andra två
            importflödena matchar mot befintliga kunder.
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/settings/import/customers">Importera kunder</Link>} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Maskinägande (Crona)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Importera Cronas separata rapport över vilka maskiner varje kund äger. Ägarbyten flaggas
            tydligt i förhandsgranskningen innan de sparas.
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/settings/import/ownership">Importera maskinägande</Link>} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Garantiprodukter (Stiga/Stihl)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Importera registrerade produkter med garanti, nedladdade från Stigas eller Stihls
            återförsäljarportal. Fungerar för båda tillverkarna.
          </p>
          <Button variant="outline" nativeButton={false} render={<Link href="/settings/import/warranty">Importera garantiprodukter</Link>} />
        </CardContent>
      </Card>
    </div>
  );
}
