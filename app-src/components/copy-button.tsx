"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

/**
 * Liten kopiera-till-urklipp-ikon, samma mönster som MailtoLink redan
 * använder för e-postadresser — återanvänds här för serienummer m.m.
 * preventDefault + stopPropagation så knappen är säker att nästla inuti
 * en klickbar rad/Link utan att trigga navigering.
 */
export function CopyButton({
  value,
  copiedMessage,
  ariaLabel,
  className,
}: {
  value: string;
  copiedMessage: string;
  ariaLabel: string;
  className?: string;
}) {
  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(value);
    toast.success(copiedMessage);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={ariaLabel}
      aria-label={ariaLabel}
      className={`text-muted-foreground hover:text-foreground shrink-0 ${className ?? ""}`}
    >
      <Copy className="size-3.5" />
    </button>
  );
}
