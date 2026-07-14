import { prisma } from "@/lib/db";

export interface AudienceMachine {
  machineId: string;
  manufacturerId: string;
  categoryId: string | null;
  modelId: string;
  modelLabel: string;
  serialNumber: string;
  purchaseYear: number | null;
}

export interface AudienceCustomer {
  customerId: string;
  customerLabel: string;
  phone: string | null;
  email: string | null;
  machines: AudienceMachine[];
}

/**
 * Alla samtyckande kunder med sina aktiva maskiner (kategori/tillverkare/
 * inköpsår isatt per maskin) — grunddata för "riktad målgrupp"-filtreringen
 * i lib/audienceFilter.ts. Ingen filtrering görs här; det görs i klienten
 * (components/audience-builder.tsx) så filterbyten är direkta utan
 * serverrundtur. En kund utan maskiner har en tom `machines`-lista — det är
 * fortfarande giltigt för en ren marknadsföringskampanj (kräver ingen
 * maskinkoppling), men filtreras automatiskt bort så fort ett maskinfilter
 * är aktivt.
 */
export async function getAudienceCustomers(): Promise<AudienceCustomer[]> {
  const customers = await prisma.customer.findMany({
    where: { isDeleted: false, marketingConsent: true },
    orderBy: { name: "asc" },
    include: {
      ownerships: {
        where: { ownedUntil: null },
        include: {
          machine: { include: { model: { include: { manufacturer: true, category: true } } } },
        },
      },
    },
  });

  return customers.map((c) => ({
    customerId: c.id,
    customerLabel: c.company ? `${c.company} - ${c.name}` : c.name,
    phone: c.phone,
    email: c.email,
    machines: c.ownerships.map((o) => ({
      machineId: o.machine.id,
      manufacturerId: o.machine.model.manufacturerId,
      categoryId: o.machine.model.categoryId,
      modelId: o.machine.model.id,
      modelLabel: `${o.machine.model.manufacturer.name} ${o.machine.model.modelName}`,
      serialNumber: o.machine.serialNumber,
      purchaseYear: o.machine.purchaseDate ? o.machine.purchaseDate.getFullYear() : null,
    })),
  }));
}

export interface AudienceFilterOptions {
  manufacturers: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  models: { id: string; manufacturerId: string; categoryId: string | null; label: string }[];
}

/** Alternativen filterkontrollerna (components/audience-filters.tsx) fylls med. */
export async function getAudienceFilterOptions(): Promise<AudienceFilterOptions> {
  const [manufacturers, categories, models] = await Promise.all([
    prisma.manufacturer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.machineModel.findMany({
      include: { manufacturer: true },
      orderBy: [{ manufacturer: { name: "asc" } }, { modelName: "asc" }],
    }),
  ]);

  return {
    manufacturers,
    categories,
    models: models.map((m) => ({
      id: m.id,
      manufacturerId: m.manufacturerId,
      categoryId: m.categoryId,
      label: `${m.manufacturer.name} ${m.modelName}`,
    })),
  };
}
