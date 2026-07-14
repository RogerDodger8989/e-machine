"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AudienceBuilder } from "@/components/audience-builder";
import { sendCampaignSheetBulk } from "@/app/messages/campaigns/sheets/send/actions";
import type { AudienceCustomer, AudienceFilterOptions } from "@/lib/audienceBuilder";

interface FlatRecipient {
  machineId: string;
  customerLabel: string;
  email: string;
  modelLabel: string;
  serialNumber: string;
}

/** Kampanjblad kräver e-post + en specifik maskin — bryter ut en rad per
 * maskin ur den kundcentrerade (och ev. filtrerade) listan. Kunder utan
 * e-post eller utan (matchande) maskiner faller bort helt här. */
function flattenRecipients(customers: AudienceCustomer[]): FlatRecipient[] {
  const rows: FlatRecipient[] = [];
  for (const c of customers) {
    if (!c.email) continue;
    for (const m of c.machines) {
      rows.push({
        machineId: m.machineId,
        customerLabel: c.customerLabel,
        email: c.email,
        modelLabel: m.modelLabel,
        serialNumber: m.serialNumber,
      });
    }
  }
  return rows;
}

export function CampaignSheetBulkSend({
  templateKeys,
  customers,
  filterOptions,
}: {
  templateKeys: string[];
  customers: AudienceCustomer[];
  filterOptions: AudienceFilterOptions;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(templateKeys[0] ?? "");
  const [selectedMachines, setSelectedMachines] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function toggleOne(id: string) {
    setSelectedMachines((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSend() {
    startTransition(async () => {
      const res = await sendCampaignSheetBulk([...selectedMachines], selectedTemplate);
      setResult(
        `${res.sent} skickade, ${res.blocked} blockerade (inget samtycke/kontaktväg), ${res.failed} misslyckades` +
          (res.skipped > 0 ? `, ${res.skipped} hoppades över (redan skickat nyligen eller ingen ägare)` : "") +
          "."
      );
      setSelectedMachines(new Set());
    });
  }

  if (templateKeys.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Inga aktiva kampanjblad finns ännu. Skapa ett under Utskick → Kampanj → Kampanjblad.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 space-y-1.5">
          <p className="text-sm font-medium">Välj kampanjblad</p>
          <Select
            value={selectedTemplate}
            onValueChange={(v) => v && setSelectedTemplate(v)}
            items={Object.fromEntries(templateKeys.map((k) => [k, k]))}
          >
            <SelectTrigger className="w-full sm:w-80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {templateKeys.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <AudienceBuilder customers={customers} {...filterOptions}>
        {(filtered) => {
          const recipients = flattenRecipients(filtered);
          const allSelected = recipients.length > 0 && recipients.every((r) => selectedMachines.has(r.machineId));
          function toggleAllFiltered() {
            setSelectedMachines((prev) => {
              const next = new Set(prev);
              if (allSelected) recipients.forEach((r) => next.delete(r.machineId));
              else recipients.forEach((r) => next.add(r.machineId));
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
                      <TableHead>Maskin</TableHead>
                      <TableHead>Serienummer</TableHead>
                      <TableHead>E-post</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipients.map((r) => (
                      <TableRow key={r.machineId}>
                        <TableCell>
                          <Checkbox
                            checked={selectedMachines.has(r.machineId)}
                            onCheckedChange={() => toggleOne(r.machineId)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{r.customerLabel}</TableCell>
                        <TableCell>{r.modelLabel}</TableCell>
                        <TableCell>{r.serialNumber}</TableCell>
                        <TableCell>{r.email}</TableCell>
                      </TableRow>
                    ))}
                    {recipients.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Inga maskiner med en samtyckande, mailbar ägare hittades.
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

      <Button disabled={selectedMachines.size === 0 || !selectedTemplate || isPending} onClick={handleSend}>
        {isPending ? "Skickar…" : `Skicka till valda (${selectedMachines.size})`}
      </Button>
      {result && <p className="text-sm text-muted-foreground">{result}</p>}
    </div>
  );
}
