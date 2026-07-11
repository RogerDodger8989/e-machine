"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

/**
 * Gör en e-postadress klickbar: själva adressen öppnar ett nytt
 * utkast i Outlook.com (outlook.live.com) i en ny flik, och en liten
 * kopiera-ikon bredvid kopierar adressen till urklipp med en bekräftelse.
 */
export function MailtoLink({ email, className }: { email: string; className?: string }) {
  async function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(email);
    toast.success("E-postadress kopierad");
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ""}`}>
      <a
        href={`https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(email)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {email}
      </a>
      <button
        type="button"
        onClick={handleCopy}
        title="Kopiera e-postadress"
        aria-label="Kopiera e-postadress"
        className="text-muted-foreground hover:text-foreground shrink-0"
      >
        <Copy className="size-3.5" />
      </button>
    </span>
  );
}
