"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { sendCampaign } from "@/app/settings/campaigns/actions";

export interface CampaignCustomer {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
}

export interface CampaignTemplate {
  key: string;
  channel: string;
  subject: string | null;
  body: string;
}

function customerLabel(c: CampaignCustomer): string {
  return c.company ? `${c.company} - ${c.name}` : c.name;
}

export function CampaignSend({
  customers,
  templates,
}: {
  customers: CampaignCustomer[];
  templates: CampaignTemplate[];
}) {
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  const allSelected = customers.length > 0 && selectedCustomers.size === customers.length;

  function toggleAllCustomers() {
    setSelectedCustomers(allSelected ? new Set() : new Set(customers.map((c) => c.id)));
  }

  function toggleCustomer(id: string) {
    setSelectedCustomers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleTemplate(key: string) {
    setSelectedTemplates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleSend() {
    startTransition(async () => {
      const res = await sendCampaign([...selectedCustomers], [...selectedTemplates]);
      setResult(
        `${res.sent} skickade, ${res.blocked} blockerade (inget samtycke/kontaktväg), ${res.failed} misslyckades` +
          (res.skipped > 0 ? `, ${res.skipped} redan skickade nyligen (hoppades över)` : "") +
          "."
      );
      setSelectedCustomers(new Set());
    });
  }

  if (templates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Inga aktiva mallar med rättslig grund &quot;Marknadsföring&quot; finns ännu. Skapa en
        under Inställningar → Mallar.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 space-y-2">
          <p className="text-sm font-medium">Välj mall(ar) att skicka</p>
          {templates.map((t) => (
            <label key={t.key} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selectedTemplates.has(t.key)}
                onCheckedChange={() => toggleTemplate(t.key)}
              />
              <span>
                {t.key} <span className="text-muted-foreground">({t.channel === "sms" ? "SMS" : "E-post"})</span>
              </span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAllCustomers} />
                </TableHead>
                <TableHead>Kund</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>E-post</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCustomers.has(c.id)}
                      onCheckedChange={() => toggleCustomer(c.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{customerLabel(c)}</TableCell>
                  <TableCell>{c.phone ?? "—"}</TableCell>
                  <TableCell>{c.email ?? "—"}</TableCell>
                </TableRow>
              ))}
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Inga kunder har lämnat samtycke till utskick ännu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Button
        disabled={selectedCustomers.size === 0 || selectedTemplates.size === 0 || isPending}
        onClick={handleSend}
      >
        {isPending ? "Skickar…" : `Skicka till valda (${selectedCustomers.size})`}
      </Button>
      {result && <p className="text-sm text-muted-foreground">{result}</p>}
    </div>
  );
}
