"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sendCampaignSheetBulk } from "@/app/settings/campaign-sheet/send/actions";

export interface CampaignSheetRecipient {
  machineId: string;
  customerName: string;
  email: string;
  modelLabel: string;
  serialNumber: string;
}

export function CampaignSheetBulkSend({
  templateKeys,
  recipients,
}: {
  templateKeys: string[];
  recipients: CampaignSheetRecipient[];
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(templateKeys[0] ?? "");
  const [selectedMachines, setSelectedMachines] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  const allSelected = recipients.length > 0 && selectedMachines.size === recipients.length;

  function toggleAll() {
    setSelectedMachines(allSelected ? new Set() : new Set(recipients.map((r) => r.machineId)));
  }

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
        Inga aktiva kampanjblad finns ännu. Skapa ett under Inställningar → Kampanjblad.
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
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
                  <TableCell className="font-medium">{r.customerName}</TableCell>
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

      <Button disabled={selectedMachines.size === 0 || !selectedTemplate || isPending} onClick={handleSend}>
        {isPending ? "Skickar…" : `Skicka till valda (${selectedMachines.size})`}
      </Button>
      {result && <p className="text-sm text-muted-foreground">{result}</p>}
    </div>
  );
}
