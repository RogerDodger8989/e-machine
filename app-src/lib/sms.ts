// GSM 03.38 (3GPP TS 23.038) "default alphabet" — the character set an SMS
// is encoded with unless it contains something outside it, in which case
// the whole message switches to UCS-2 and the per-segment limit roughly
// halves. Å/å/Ä/ä/Ö/ö are part of the BASIC table (Nordic-market design),
// so plain Swedish text stays GSM-7 at 160 chars — it's characters like
// emoji or curly quotes that force the shorter UCS-2 limit.
const GSM7_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅå" +
  "Δ_ΦΓΛΩΠΨΣΘΞÆæßÉ" +
  ' !"#¤%&\'()*+,-./' +
  "0123456789:;<=>?" +
  "¡ABCDEFGHIJKLMNO" +
  "PQRSTUVWXYZÄÖÑÜ§" +
  "¿abcdefghijklmno" +
  "pqrstuvwxyzäöñüà";

// Extension-table characters still encode as GSM-7, but cost 2 septets each
// (an escape code + the character) instead of 1.
const GSM7_EXTENDED = "^{}\\[~]|€\f";

export interface SmsAnalysis {
  /** Encoded length — septets for GSM-7 (extension chars count as 2), UTF-16 code units for UCS-2. */
  length: number;
  encoding: "GSM-7" | "UCS-2";
  /** Max length for a single (non-concatenated) SMS. */
  singleLimit: number;
  /** Max length per segment once a message needs to be split into multiple SMS. */
  segmentLimit: number;
  /** Number of SMS this message will be billed/split as (0 for empty text). */
  segments: number;
}

function isGsm7(text: string): boolean {
  for (const ch of text) {
    if (!GSM7_BASIC.includes(ch) && !GSM7_EXTENDED.includes(ch)) return false;
  }
  return true;
}

function gsm7Septets(text: string): number {
  let count = 0;
  for (const ch of text) count += GSM7_EXTENDED.includes(ch) ? 2 : 1;
  return count;
}

export function analyzeSmsBody(text: string): SmsAnalysis {
  if (text.length === 0) {
    return { length: 0, encoding: "GSM-7", singleLimit: 160, segmentLimit: 153, segments: 0 };
  }

  if (isGsm7(text)) {
    const length = gsm7Septets(text);
    const singleLimit = 160;
    const segmentLimit = 153;
    return {
      length,
      encoding: "GSM-7",
      singleLimit,
      segmentLimit,
      segments: length <= singleLimit ? 1 : Math.ceil(length / segmentLimit),
    };
  }

  const length = text.length;
  const singleLimit = 70;
  const segmentLimit = 67;
  return {
    length,
    encoding: "UCS-2",
    singleLimit,
    segmentLimit,
    segments: length <= singleLimit ? 1 : Math.ceil(length / segmentLimit),
  };
}

/** 46elks tillåter en alfanumerisk avsändare på max 11 tecken, endast
 * A–Z/a–z/0–9 (inga å/ä/ö) — gäller inte om avsändaren är ett telefonnummer. */
export function isValidAlphanumericSender(from: string): boolean {
  return /^[A-Za-z0-9]{1,11}$/.test(from);
}
