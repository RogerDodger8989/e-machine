"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { updateAutoBackupEnabled } from "@/app/settings/backup/actions";

export function AutoBackupToggle({ enabled }: { enabled: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(value: boolean | "indeterminate") {
    const checked = value === true;
    startTransition(async () => {
      try {
        await updateAutoBackupEnabled(checked);
        toast.success(checked ? "Automatisk backup påslagen" : "Automatisk backup avstängd");
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Checkbox id="autoBackupEnabled" checked={enabled} onCheckedChange={handleChange} disabled={isPending} />
      <Label htmlFor="autoBackupEnabled" className="font-normal">
        Automatisk backup påslagen
      </Label>
    </div>
  );
}
