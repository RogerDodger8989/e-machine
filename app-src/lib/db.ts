import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/app/generated/prisma/client";
import { resolveDbPath } from "@/lib/dbPath";

function createClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: `file:${resolveDbPath()}` });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prismaClient?: PrismaClient };

let client = globalForPrisma.prismaClient ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prismaClient = client;

/**
 * Proxy istället för en direkt PrismaClient-instans: vid databasåterställning
 * (restore från backupfil) måste den underliggande anslutningen stängas och
 * öppnas mot den nya filen. Eftersom alla anrop går via denna proxy slår det
 * igenom överallt i appen utan att varje importerande modul behöver hämta om
 * klienten själv.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(client as object, prop, receiver);
  },
});

/** Stänger nuvarande anslutning och öppnar en ny mot samma DATABASE_URL —
 * används efter att databasfilen bytts ut vid en återställning. */
export async function reconnectDb(): Promise<void> {
  await client.$disconnect();
  client = createClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prismaClient = client;
}

/** Stänger anslutningen helt (utan att öppna en ny) — behövs för att släppa
 * filhandtaget innan databasfilen skrivs över vid återställning. */
export async function disconnectDb(): Promise<void> {
  await client.$disconnect();
}
