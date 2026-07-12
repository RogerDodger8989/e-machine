import { prisma } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";

export type CustomerMatchStatus = "matched-id" | "matched-phone" | "matched-email" | "ambiguous" | "new";

export interface CustomerMatchResult {
  status: CustomerMatchStatus;
  customerId: string | null;
}

export interface CustomerMatchInput {
  externalId?: string;
  phone?: string;
  email?: string;
}

/**
 * Matchar en importrad mot en befintlig kund i tre steg, delad av alla tre
 * importflödena (kunder/maskinägande/garantiprodukter):
 * 1. Crona-kundnummer (externalCronaId), om kolumnen mappats och raden har
 *    ett värde. Ingen träff här faller INTE vidare till telefon/e-post —
 *    ett angivet ID som inte matchar ska bli en ny kund med det ID:t, inte
 *    riskera att råka matcha fel person via telefonnummer.
 * 2. Telefonnummer (normaliserat, samma format som används för sökning).
 * 3. E-post (skiftlägesokänsligt).
 * Matchar ett steg flera kunder tvetydigt (t.ex. ett delat hushållsnummer)
 * flaggas raden som "ambiguous" istället för att gissa fel person.
 */
export async function matchCustomer(input: CustomerMatchInput): Promise<CustomerMatchResult> {
  const externalId = input.externalId?.trim();
  if (externalId) {
    const byId = await prisma.customer.findUnique({ where: { externalCronaId: externalId } });
    return byId ? { status: "matched-id", customerId: byId.id } : { status: "new", customerId: null };
  }

  const phoneNormalized = input.phone ? normalizePhone(input.phone) : null;
  if (phoneNormalized) {
    const byPhone = await prisma.customer.findMany({
      where: { phoneNormalized, isDeleted: false },
      select: { id: true },
    });
    if (byPhone.length === 1) return { status: "matched-phone", customerId: byPhone[0].id };
    if (byPhone.length > 1) return { status: "ambiguous", customerId: null };
  }

  const email = input.email?.trim().toLowerCase();
  if (email) {
    // SQLite stödjer inte case-insensitive matchning direkt — jämför i JS.
    const candidates = await prisma.customer.findMany({
      where: { isDeleted: false, email: { not: null } },
      select: { id: true, email: true },
    });
    const matches = candidates.filter((c) => c.email?.toLowerCase() === email);
    if (matches.length === 1) return { status: "matched-email", customerId: matches[0].id };
    if (matches.length > 1) return { status: "ambiguous", customerId: null };
  }

  return { status: "new", customerId: null };
}
