"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { updateCustomerNotes } from "@/app/customers/actions";

export function CustomerNotesCard({ customerId, notes }: { customerId: string; notes: string }) {
  const [value, setValue] = useState(notes);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await updateCustomerNotes(customerId, value);
      setSaved(true);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anteckningar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          rows={3}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          placeholder="Skriv en notering om kunden…"
        />
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Sparar…" : "Spara"}
          </Button>
          {saved && <p className="text-sm text-muted-foreground">Sparat.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
