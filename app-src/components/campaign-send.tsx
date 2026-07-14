"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AudienceBuilder } from "@/components/audience-builder";
import { sendCampaign } from "@/app/messages/campaigns/send/actions";
import type { AudienceCustomer, AudienceFilterOptions } from "@/lib/audienceBuilder";

export interface CampaignTemplate {
  key: string;
  channel: string;
  subject: string | null;
  body: string;
}

export function CampaignSend({
  customers,
  templates,
  filterOptions,
}: {
  customers: AudienceCustomer[];
  templates: CampaignTemplate[];
  filterOptions: AudienceFilterOptions;
}) {
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

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

      <AudienceBuilder customers={customers} {...filterOptions}>
        {(filtered) => {
          const allSelected = filtered.length > 0 && filtered.every((c) => selectedCustomers.has(c.customerId));
          function toggleAllFiltered() {
            setSelectedCustomers((prev) => {
              const next = new Set(prev);
              if (allSelected) filtered.forEach((c) => next.delete(c.customerId));
              else filtered.forEach((c) => next.add(c.customerId));
              return next;
            });
          }
          return (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox checked={allSelected} onCheckedChange={toggleAllFiltered} />
                      </TableHead>
                      <TableHead>Kund</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>E-post</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c) => (
                      <TableRow key={c.customerId}>
                        <TableCell>
                          <Checkbox
                            checked={selectedCustomers.has(c.customerId)}
                            onCheckedChange={() => toggleCustomer(c.customerId)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{c.customerLabel}</TableCell>
                        <TableCell>{c.phone ?? "—"}</TableCell>
                        <TableCell>{c.email ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          Inga kunder matchar filtret.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        }}
      </AudienceBuilder>

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
