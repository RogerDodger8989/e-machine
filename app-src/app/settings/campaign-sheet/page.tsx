import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { TemplateVariableReference } from "@/components/template-variable-reference";

export const dynamic = "force-dynamic";

export default async function CampaignSheetListPage() {
  const templates = await prisma.messageTemplate.findMany({
    where: { legalBasis: "campaign_sheet" },
    orderBy: { key: "asc" },
  });

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Inställningar", href: "/settings" },
          { label: "Kampanjblad", href: "/settings/campaign-sheet" },
        ]}
      />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold">Kampanjblad</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/settings/campaign-sheet/send">Maila till flera kunder</Link>}
          />
          <Button nativeButton={false} render={<Link href="/settings/campaign-sheet/new">Nytt kampanjblad</Link>} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Skapa ett eller flera kampanjblad. De skrivs ut från en maskins sida (Maskiner → en maskin med
        hämt-/lämnservice → Kampanjblad) eller mailas — enstaka direkt från maskinsidan, eller till flera
        kunder samtidigt härifrån. Mail kräver att kunden lämnat marknadsföringssamtycke.
      </p>
      <TemplateVariableReference showMallarNote={false} />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Namn</TableHead>
                <TableHead>Ämne</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Link href={`/settings/campaign-sheet/${t.id}/edit`} className="hover:underline font-medium">
                      {t.key}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{t.subject ?? "—"}</TableCell>
                  <TableCell>
                    {t.isActive ? <Badge>Aktiv</Badge> : <Badge variant="secondary">Inaktiv</Badge>}
                  </TableCell>
                </TableRow>
              ))}
              {templates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Inga kampanjblad ännu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
