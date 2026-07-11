"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { unlinkMachine } from "@/app/machines/actions";

const REASONS = [
  { value: "sold", label: "Såld" },
  { value: "scrapped", label: "Skrotad" },
  { value: "returned", label: "Returnerad" },
  { value: "other", label: "Annat" },
];

export function UnlinkMachineButton({ machineId }: { machineId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("sold");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline">Frikoppla från ägare</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Frikoppla maskin?</DialogTitle>
          <DialogDescription>
            Maskinen kopplas bort från nuvarande ägare men behåller hela sin
            servicehistorik. Använd detta när maskinen sålts vidare eller skrotats.
          </DialogDescription>
        </DialogHeader>
        <Select
          value={reason}
          onValueChange={(value) => value && setReason(value)}
          items={Object.fromEntries(REASONS.map((r) => [r.value, r.label]))}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REASONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Avbryt
          </Button>
          <Button
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                await unlinkMachine(machineId, reason);
                setOpen(false);
                router.refresh();
              });
            }}
          >
            {isPending ? "Frikopplar…" : "Frikoppla"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
