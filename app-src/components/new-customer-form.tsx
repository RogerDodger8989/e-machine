"use client";

import { useState, useTransition } from "react";
import { createCustomer } from "@/app/customers/actions";
import { isRedirectError } from "@/lib/isRedirectError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export function NewCustomerForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createCustomer(formData);
      } catch (err) {
        if (isRedirectError(err)) throw err;
        setError((err as Error).message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="company">Företag</Label>
        <Input id="company" name="company" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Kontaktperson *</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefonnummer</Label>
        <Input id="phone" name="phone" type="tel" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-post</Label>
        <Input id="email" name="email" type="email" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="address">Adress</Label>
        <Input id="address" name="address" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="postalCode">Postnummer</Label>
          <Input id="postalCode" name="postalCode" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">Ort</Label>
          <Input id="city" name="city" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">Anteckningar</Label>
        <Textarea id="notes" name="notes" rows={3} />
      </div>
      <div className="flex items-start gap-2">
        <Checkbox id="marketingConsent" name="marketingConsent" defaultChecked />
        <Label htmlFor="marketingConsent" className="font-normal leading-snug">
          Kunden samtycker till att få SMS/e-post om erbjudanden och nyheter (utöver
          service­påminnelser, som inte kräver samtycke).
        </Label>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sparar…" : "Spara kund"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
