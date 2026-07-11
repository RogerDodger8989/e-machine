"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { DueServiceReminder } from "@/lib/jobs/serviceReminders";
import { sendServiceReminders, type ReminderChannel } from "@/app/settings/service-reminders/actions";

function customerLabel(r: DueServiceReminder): string {
  return r.company ? `${r.company} - ${r.customerName}` : r.customerName;
}

export function ServiceRemindersReview({
  reminders,
  smsAvailable,
  emailAvailable,
}: {
  reminders: DueServiceReminder[];
  smsAvailable: boolean;
  emailAvailable: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sendSms, setSendSms] = useState(smsAvailable);
  const [sendEmail, setSendEmail] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  const allSelected = reminders.length > 0 && selected.size === reminders.length;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(reminders.map((r) => r.machineId)));
  }

  function toggleOne(machineId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(machineId)) next.delete(machineId);
      else next.add(machineId);
      return next;
    });
  }

  const channels = useMemo(() => {
    const list: ReminderChannel[] = [];
    if (sendSms) list.push("sms");
    if (sendEmail) list.push("email");
    return list;
  }, [sendSms, sendEmail]);

  function handleSend() {
    const machineIds = [...selected];
    startTransition(async () => {
      const res = await sendServiceReminders(machineIds, channels);
      setResult(
        `${res.sent} skickade, ${res.blocked} blockerade (saknad kontaktväg/samtycke), ${res.failed} misslyckades, ${res.alreadySent} redan påminda (hoppades över).`
      );
      setSelected(new Set());
    });
  }

  if (reminders.length === 0) {
    return <p className="text-sm text-muted-foreground">Inga maskiner är aktuella för påminnelse just nu.</p>;
  }

  return (
    <div className="space-y-4">
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
                <TableHead>Förfallodatum</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminders.map((r) => (
                <TableRow key={r.machineId}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(r.machineId)}
                      onCheckedChange={() => toggleOne(r.machineId)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{customerLabel(r)}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.phone ?? "—"} {r.email ? `· ${r.email}` : ""}
                    </div>
                  </TableCell>
                  <TableCell>
                    {r.modelLabel} <span className="text-muted-foreground">({r.serialNumber})</span>
                  </TableCell>
                  <TableCell>{new Date(r.nextDueDate).toLocaleDateString("sv-SE")}</TableCell>
                  <TableCell>
                    {r.alreadyNotifiedAt ? (
                      <Badge variant="secondary">
                        Redan påmind {new Date(r.alreadyNotifiedAt).toLocaleDateString("sv-SE")}
                      </Badge>
                    ) : (
                      <Badge variant="default">Ej påmind</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={sendSms}
                disabled={!smsAvailable}
                onCheckedChange={(v) => setSendSms(v === true)}
              />
              SMS {!smsAvailable && <span className="text-muted-foreground">(ingen aktiv mall "service_reminder_sms")</span>}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={sendEmail}
                disabled={!emailAvailable}
                onCheckedChange={(v) => setSendEmail(v === true)}
              />
              E-post {!emailAvailable && <span className="text-muted-foreground">(ingen aktiv mall "service_reminder_email")</span>}
            </label>
          </div>
          <Button
            disabled={selected.size === 0 || channels.length === 0 || isPending}
            onClick={handleSend}
          >
            {isPending ? "Skickar…" : `Skicka till valda (${selected.size})`}
          </Button>
          {result && <p className="text-sm text-muted-foreground">{result}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
