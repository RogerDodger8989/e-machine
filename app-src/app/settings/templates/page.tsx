import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { TemplateVariableReference } from "@/components/template-variable-reference";

export const dynamic = "force-dynamic";

const LEGAL_BASIS_LABEL: Record<string, string> = {
  service_reminder: "Servicepåminnelse",
  marketing: "Marknadsföring",
  order_ready: "Sms",
  campaign_sheet: "Kampanjblad",
};

export default async function MessageTemplatesPage() {
  const templates = await prisma.messageTemplate.findMany({ orderBy: { key: "asc" } });

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Inställningar", href: "/settings" },
          { label: "Mallar för utskick", href: "/settings/templates" },
        ]}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mallar för utskick</h1>
        <Button nativeButton={false} render={<Link href="/settings/templates/new">Ny mall</Link>} />
      </div>
      <TemplateVariableReference />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nyckel</TableHead>
                <TableHead>Kanal</TableHead>
                <TableHead>Rättslig grund</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Link href={`/settings/templates/${t.id}/edit`} className="hover:underline font-medium">
                      {t.key}
                    </Link>
                  </TableCell>
                  <TableCell>{t.channel === "sms" ? "SMS" : "E-post"}</TableCell>
                  <TableCell>{LEGAL_BASIS_LABEL[t.legalBasis] ?? t.legalBasis}</TableCell>
                  <TableCell>
                    {t.isActive ? <Badge>Aktiv</Badge> : <Badge variant="secondary">Inaktiv</Badge>}
                  </TableCell>
                </TableRow>
              ))}
              {templates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Inga mallar ännu.
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
