"use client";

import { CopyButton } from "@/components/copy-button";

/**
 * Gör en e-postadress klickbar: själva adressen öppnar ett nytt
 * utkast i Outlook.com (outlook.live.com) i en ny flik, och en liten
 * kopiera-ikon bredvid kopierar adressen till urklipp med en bekräftelse.
 */
export function MailtoLink({ email, className }: { email: string; className?: string }) {
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
      <CopyButton value={email} copiedMessage="E-postadress kopierad" ariaLabel="Kopiera e-postadress" />
    </span>
  );
}
