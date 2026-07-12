"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const VARIABLES = [
  { variable: "{{customer_name}}", example: "Kalle Karlsson", description: "Kundens namn" },
  { variable: "{{model_name}}", example: "Stiga Park 500W", description: "Tillverkare + modellnamn" },
  { variable: "{{serial_number}}", example: "SN123456", description: "Maskinens serienummer" },
  {
    variable: "{{shop_name}}",
    example: "ÖsterlenExperten",
    description: "Ert företagsnamn (Inställningar → Företagsuppgifter)",
  },
];

async function copyVariable(variable: string) {
  await navigator.clipboard.writeText(variable);
  toast.success(`${variable} kopierad`);
}

export function TemplateVariableReference({ showMallarNote = true }: { showMallarNote?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Variabler du kan använda i mallens text</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Variabel</TableHead>
              <TableHead>Exempel</TableHead>
              <TableHead>Betyder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {VARIABLES.map((v) => (
              <TableRow key={v.variable}>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => copyVariable(v.variable)}
                    className="inline-flex items-center gap-1.5 rounded bg-muted px-1.5 py-0.5 font-mono text-xs hover:bg-muted/70"
                    title="Klicka för att kopiera"
                  >
                    {v.variable}
                    <Copy className="size-3 text-muted-foreground" />
                  </button>
                </TableCell>
                <TableCell className="text-muted-foreground">{v.example}</TableCell>
                <TableCell className="text-muted-foreground">{v.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {showMallarNote && (
          <p className="text-xs text-muted-foreground">
            Gäller mallar med rättslig grund <strong>Servicepåminnelse</strong> och{" "}
            <strong>Marknadsföring</strong> — nyckeln <code>service_reminder</code> används av det
            dagliga påminnelsejobbet. <strong>Sms-mallar</strong> (Klar för hämtning m.fl.) är ren text
            utan variabler — det du skriver skickas exakt som det står, och kan redigeras fritt för
            varje utskick på Sms-sidan.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
