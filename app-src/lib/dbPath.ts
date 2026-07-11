import path from "node:path";

/** Måste spegla exakt hur @prisma/adapter-better-sqlite3 tolkar DATABASE_URL
 * (strippar "file:"-prefixet och lämnar resten till better-sqlite3, som
 * upplöser relativa sökvägar relativt process.cwd()). Backup/återställning
 * behöver samma absoluta sökväg utanför Prisma-klienten. */
export function resolveDbPath(): string {
  const raw = process.env.DATABASE_URL ?? "file:../data/e-machines.db";
  const relativeOrAbsolute = raw.replace(/^file:/, "");
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), relativeOrAbsolute);
}
