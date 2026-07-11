"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { RotateCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { resendMessage, deleteMessageLog } from "@/app/messages/actions";

interface LogRow {
  id: string;
  channel: string;
  legalBasis: string;
  status: string;
  recipientAddress: string | null;
  bodySent: string;
  createdAt: Date;
  errorMessage?: string | null;
  customerLabel?: string;
  customerId?: string | null;
  canResend?: boolean;
  resendDisabledReason?: string;
  wasRetried?: boolean;
}

const CHANNEL_LABEL: Record<string, string> = { sms: "SMS", email: "E-post" };
const LEGAL_BASIS_LABEL: Record<string, string> = {
  service_reminder: "Servicepåminnelse",
  marketing: "Marknadsföring",
  order_ready: "Sms",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  sent: "default",
  blocked: "secondary",
  failed: "destructive",
};
const STATUS_LABEL: Record<string, string> = { sent: "Skickat", blocked: "Blockerat", failed: "Misslyckades" };

function ResendButton({ log }: { log: LogRow }) {
  const [isPending, startTransition] = useTransition();

  function handleResend() {
    startTransition(async () => {
      const res = await resendMessage(log.id);
      if (res.ok) toast.success(`Skickat om (${STATUS_LABEL[res.status] ?? res.status}).`);
      else toast.error(res.reason);
    });
  }

  return (
    <Button
      variant="outline"
      size="icon-sm"
      disabled={!log.canResend || isPending}
      onClick={handleResend}
      title={log.canResend ? "Skicka om" : log.resendDisabledReason}
      aria-label="Skicka om"
    >
      <RotateCw className={isPending ? "animate-spin" : undefined} />
    </Button>
  );
}

function DeleteLogButton({ log }: { log: LogRow }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteMessageLog(log.id);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="icon-sm" title="Ta bort" aria-label="Ta bort">
            <Trash2 />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ta bort raden?</DialogTitle>
          <DialogDescription>
            Loggraden till {log.recipientAddress ?? "okänd mottagare"} raderas permanent.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Avbryt
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Tar bort…" : "Ta bort"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MessageLogTable({ logs, showCustomer = false }: { logs: LogRow[]; showCustomer?: boolean }) {
  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground">Inga utskick registrerade.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Datum</TableHead>
          {showCustomer && <TableHead>Kund</TableHead>}
          <TableHead>Kanal</TableHead>
          <TableHead>Typ</TableHead>
          <TableHead>Mottagare</TableHead>
          <TableHead>Innehåll</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-20" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="whitespace-nowrap">{log.createdAt.toLocaleString("sv-SE")}</TableCell>
            {showCustomer && (
              <TableCell>
                {log.customerId && log.customerLabel ? (
                  <Link href={`/customers/${log.customerId}`} className="hover:underline">
                    {log.customerLabel}
                  </Link>
                ) : (
                  (log.customerLabel ?? "—")
                )}
              </TableCell>
            )}
            <TableCell>{CHANNEL_LABEL[log.channel] ?? log.channel}</TableCell>
            <TableCell>{LEGAL_BASIS_LABEL[log.legalBasis] ?? log.legalBasis}</TableCell>
            <TableCell>{log.recipientAddress ?? "—"}</TableCell>
            <TableCell className="max-w-[160px] truncate" title={log.bodySent}>
              {log.bodySent}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5">
                <Badge variant={STATUS_VARIANT[log.status] ?? "secondary"} title={log.errorMessage ?? undefined}>
                  {STATUS_LABEL[log.status] ?? log.status}
                </Badge>
                {log.wasRetried && <span className="text-xs text-muted-foreground">omskickad</span>}
              </div>
            </TableCell>
            <TableCell>
              {log.status === "failed" && (
                <div className="flex items-center gap-1">
                  {log.canResend !== undefined && <ResendButton log={log} />}
                  <DeleteLogButton log={log} />
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
