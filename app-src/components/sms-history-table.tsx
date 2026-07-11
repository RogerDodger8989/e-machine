"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Bell, RotateCw, Trash2 } from "lucide-react";
import { deleteOrder, sendOrderReminder } from "@/app/sms/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

const STATUS_LABEL: Record<string, string> = { sent: "Skickat", blocked: "Blockerat", failed: "Misslyckades" };
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  sent: "default",
  blocked: "secondary",
  failed: "destructive",
};

export interface SmsOrderRow {
  id: string;
  phoneNumber: string;
  articleDescription: string;
  amountDue: number | null;
  createdAt: Date;
  message: string;
  lastStatus: string;
  lastErrorMessage: string | null;
  reminderCount: number;
  lastReminderAt: Date | null;
}

function ReminderButton({ order }: { order: SmsOrderRow }) {
  const [isPending, startTransition] = useTransition();
  function handleClick() {
    startTransition(async () => {
      try {
        await sendOrderReminder(order.id);
        toast.success("Påminnelse skickad");
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }
  const title = order.lastReminderAt
    ? `Senaste påminnelse: ${order.lastReminderAt.toLocaleString("sv-SE")}`
    : "Skicka påminnelse";
  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={handleClick}
      disabled={isPending}
      title={title}
      aria-label="Skicka påminnelse"
      className="relative"
    >
      <Bell />
      {order.reminderCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
          {order.reminderCount}
        </span>
      )}
    </Button>
  );
}

function RetryButton({ order }: { order: SmsOrderRow }) {
  const [isPending, startTransition] = useTransition();
  function handleClick() {
    startTransition(async () => {
      try {
        await sendOrderReminder(order.id);
        toast.success("Skickat om");
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }
  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={handleClick}
      disabled={isPending}
      title="Skicka om"
      aria-label="Skicka om"
    >
      <RotateCw className={isPending ? "animate-spin" : undefined} />
    </Button>
  );
}

function DeleteButton({ order }: { order: SmsOrderRow }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteOrder(order.id);
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
            Beställningen till {order.phoneNumber} ({order.articleDescription}) och dess skickförsök raderas
            permanent, även ur utskicksloggen.
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

export function SmsHistoryTable({ orders }: { orders: SmsOrderRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => `${o.phoneNumber} ${o.articleDescription}`.toLowerCase().includes(q));
  }, [orders, query]);

  return (
    <div className="space-y-3">
      <Input
        placeholder="Sök på telefonnummer eller vara…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Inga utskick registrerade.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Vara</TableHead>
              <TableHead>Summa</TableHead>
              <TableHead>Meddelande</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="whitespace-nowrap">{o.createdAt.toLocaleString("sv-SE")}</TableCell>
                <TableCell>{o.phoneNumber}</TableCell>
                <TableCell>{o.articleDescription}</TableCell>
                <TableCell className="text-muted-foreground">
                  {o.amountDue != null ? `${o.amountDue} kr` : "—"}
                </TableCell>
                <TableCell className="max-w-xs truncate" title={o.message}>
                  {o.message}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[o.lastStatus] ?? "secondary"} title={o.lastErrorMessage ?? undefined}>
                    {STATUS_LABEL[o.lastStatus] ?? o.lastStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  {o.lastStatus === "failed" ? (
                    <div className="flex items-center gap-1">
                      <RetryButton order={o} />
                      <DeleteButton order={o} />
                    </div>
                  ) : (
                    <ReminderButton order={o} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
