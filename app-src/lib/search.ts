import { prisma } from "@/lib/db";

/**
 * Bygger en OR-kedja av trigram för fritextsökning. SQLite FTS5:s trigram-tokenizer
 * kräver att ALLA sökta trigram matchar (AND) om man frågar rakt av, vilket gör den
 * intolerant mot felstavningar. Genom att själva bryta ner söktexten i trigram och
 * fråga med OR + ranka på bm25() får vi ett beteende som liknar PostgreSQL:s
 * pg_trgm-similaritet: den mest lika träffen hamnar överst även vid felstavning.
 */
function toTrigrams(input: string): string[] {
  const s = input.toLowerCase().trim();
  const grams = new Set<string>();
  for (let i = 0; i < s.length - 2; i++) grams.add(s.slice(i, i + 3));
  if (grams.size === 0 && s.length > 0) grams.add(s);
  return [...grams];
}

function buildMatchQuery(input: string): string | null {
  const grams = toTrigrams(input);
  if (grams.length === 0) return null;
  return grams.map((g) => `"${g.replace(/"/g, '""')}"`).join(" OR ");
}

export type SearchResultType = "customer" | "machine" | "model";

export interface SearchResult {
  type: SearchResultType;
  id: string;
  label: string;
  sublabel: string | null;
  company?: string | null;
  email?: string | null;
  rank: number;
}

export async function globalSearch(query: string, limit = 20): Promise<SearchResult[]> {
  const matchQuery = buildMatchQuery(query);
  if (!matchQuery) return [];

  const [customerRows, machineRows, modelRows] = await Promise.all([
    prisma.$queryRaw<{ entity_id: string; name: string; company: string | null; phone_normalized: string | null; email: string | null; rank: number }[]>`
      SELECT entity_id, name, company, phone_normalized, email, bm25(customers_fts) AS rank
      FROM customers_fts
      WHERE customers_fts MATCH ${matchQuery}
      ORDER BY rank
      LIMIT ${limit}
    `,
    prisma.$queryRaw<{ entity_id: string; serial_number: string; rank: number }[]>`
      SELECT entity_id, serial_number, bm25(machines_fts) AS rank
      FROM machines_fts
      WHERE machines_fts MATCH ${matchQuery}
      ORDER BY rank
      LIMIT ${limit}
    `,
    prisma.$queryRaw<{ entity_id: string; model_name: string; rank: number }[]>`
      SELECT entity_id, model_name, bm25(machine_models_fts) AS rank
      FROM machine_models_fts
      WHERE machine_models_fts MATCH ${matchQuery}
      ORDER BY rank
      LIMIT ${limit}
    `,
  ]);

  const customerIds = customerRows.map((r) => r.entity_id);
  const deletedFlags = customerIds.length
    ? await prisma.customer.findMany({
        where: { id: { in: customerIds } },
        select: { id: true, isDeleted: true },
      })
    : [];
  const deletedSet = new Set(deletedFlags.filter((c) => c.isDeleted).map((c) => c.id));

  const results: SearchResult[] = [
    ...customerRows
      .filter((r) => !deletedSet.has(r.entity_id))
      .map((r) => ({
        type: "customer" as const,
        id: r.entity_id,
        label: r.name,
        sublabel: r.phone_normalized,
        company: r.company || null,
        email: r.email || null,
        rank: r.rank,
      })),
    ...machineRows.map((r) => ({
      type: "machine" as const,
      id: r.entity_id,
      label: r.serial_number,
      sublabel: "Serienummer",
      rank: r.rank,
    })),
    ...modelRows.map((r) => ({
      type: "model" as const,
      id: r.entity_id,
      label: r.model_name,
      sublabel: "Maskinmodell",
      rank: r.rank,
    })),
  ];

  return results.sort((a, b) => a.rank - b.rank).slice(0, limit);
}
