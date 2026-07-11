import { TriangleAlert } from "lucide-react";

export function BackupWarningBanner({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;

  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive space-y-1">
      {warnings.map((w, i) => (
        <p key={i} className="flex items-start gap-2">
          <TriangleAlert className="size-4 shrink-0 mt-0.5" />
          <span>{w}</span>
        </p>
      ))}
    </div>
  );
}
