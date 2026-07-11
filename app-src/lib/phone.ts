export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

/**
 * Konverterar ett svenskt telefonnummer (oavsett om det är inskrivet i
 * inhemskt format med inledande 0, eller redan har landskod) till E.164
 * (+46...) som 46elks kräver för SMS. Kunder skrivs nästan alltid in i
 * inhemskt format ("0736562525"), inte E.164 — utan denna konvertering
 * avvisar 46elks alla SMS ("Expected \"+\"").
 */
export function toE164Sweden(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const trimmed = phone.trim();
  if (!trimmed) return null;
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  if (hasPlus) return `+${digits}`;
  if (digits.startsWith("0046")) return `+46${digits.slice(4)}`;
  if (digits.startsWith("46")) return `+${digits}`;
  if (digits.startsWith("0")) return `+46${digits.slice(1)}`;
  return `+46${digits}`;
}
