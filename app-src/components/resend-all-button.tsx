"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { resendAllFailed } from "@/app/messages/actions";

export function ResendAllButton({ count }: { count: number }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function handleClick() {
    setResult(null);
    startTransition(async () => {
      const res = await resendAllFailed();
      setResult(
        `${res.sent} skickade, ${res.blocked} blockerade, ${res.failed} misslyckades igen` +
          (res.skipped > 0 ? `, ${res.skipped} kunde inte skickas om` : "") +
          "."
      );
    });
  }

  if (count === 0) return null;

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" onClick={handleClick} disabled={isPending}>
        {isPending ? "Skickar om…" : `Skicka om alla olösta (${count})`}
      </Button>
      {result && <p className="text-sm text-muted-foreground">{result}</p>}
    </div>
  );
}
