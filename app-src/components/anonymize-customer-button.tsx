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
import { anonymizeCustomer } from "@/app/customers/actions";

export function AnonymizeCustomerButton({ customerId }: { customerId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive">Radera kund</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Radera kunduppgifter?</DialogTitle>
          <DialogDescription>
            Namn, telefonnummer, e-post och samtycke tas bort permanent och kan inte
            återställas. Maskinernas ägandehistorik och servicehistorik behålls
            (av säkerhets- och garantiskäl) men kopplas inte längre till några
            personuppgifter.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Avbryt
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                await anonymizeCustomer(customerId);
                setOpen(false);
                router.refresh();
              });
            }}
          >
            {isPending ? "Raderar…" : "Ja, radera personuppgifter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
