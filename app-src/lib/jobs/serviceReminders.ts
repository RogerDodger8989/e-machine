import { prisma } from "@/lib/db";
import { addMonths, subDays } from "@/lib/date";
import { resolveServiceIntervals } from "@/lib/serviceInterval";

// 60 dagar ≈ 2 månader ledtid: för en maskin med standardintervallet 12
// månader (1 år) blir den aktuell för påminnelse vid ~10 månader, så kunden
// hinner boka in service innan maskinen fyller 1 år.
const REMINDER_LEAD_DAYS = 60;

export interface DueCycle {
  nextDueDate: Date;
  alreadyNotifiedAt: Date | null;
  // Intervallet (mån) som nextDueDate faktiskt räknades fram med — kan vara
  // firstMonths (första cykeln) eller recurringMonths (senare cykler).
  // Behövs av anropare som vill räkna ut cycleStart själva (t.ex. för att
  // dedupa per kanal, se app/messages/service/actions.ts).
  cycleLengthMonths: number;
}

/**
 * Räknar fram vilken servicecykel som är aktuell just nu genom att upprepa
 * inköpsdatum + serviceintervall — det finns ingen egen registrering av
 * "utförd service" i appen, så inköpsdatumet är den enda fasta ankarpunkten
 * att räkna cykler ifrån. Första cykeln använder firstMonths (kan skilja sig
 * från återkommande cykler, t.ex. en cykel: 3 mån första gången, sedan 12),
 * varje efterföljande cykel använder recurringMonths. En cykel vars
 * förfallodatum redan passerat räknas bara som klar (och cykeln flyttas
 * fram) om en påminnelse faktiskt skickats eller blockerats under den
 * cykeln — annars fortsätter maskinen att visas som (allt mer) försenad
 * istället för att tyst hoppa fram.
 */
export async function resolveDueCycle(
  machineId: string,
  purchaseDate: Date,
  firstMonths: number,
  recurringMonths: number,
  today: Date
): Promise<DueCycle> {
  let due = addMonths(purchaseDate, firstMonths);
  let cycleLength = firstMonths;

  while (true) {
    const cycleStart = addMonths(due, -cycleLength);
    const reminded = await prisma.messageLog.findFirst({
      where: {
        machineId,
        legalBasis: "service_reminder",
        status: { in: ["sent", "blocked"] },
        createdAt: { gt: cycleStart },
      },
      orderBy: { createdAt: "desc" },
    });

    if (due < today && reminded) {
      due = addMonths(due, recurringMonths);
      cycleLength = recurringMonths;
      continue;
    }

    return { nextDueDate: due, alreadyNotifiedAt: reminded?.createdAt ?? null, cycleLengthMonths: cycleLength };
  }
}

export interface DueServiceReminder {
  machineId: string;
  customerId: string;
  customerName: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  manufacturerId: string;
  categoryId: string | null;
  modelId: string;
  modelLabel: string;
  serialNumber: string;
  purchaseYear: number | null;
  nextDueDate: string; // ISO
  alreadyNotifiedAt: string | null; // ISO, senaste service_reminder-utskick i denna cykel
}

/**
 * Beräknar vilka maskiner som är aktuella för en servicepåminnelse just nu —
 * skickar inget, bara listar kandidater för manuell granskning (se
 * app/messages/service). "Redan påmind" avgörs av om det redan
 * finns en service_reminder-logg sedan innevarande cykel startade, men det
 * filtrerar INTE bort raden — det är upp till den som skickar att avgöra,
 * med säkerhetsnätet i sendServiceReminders som skyddar mot dubblett.
 */
export async function getDueServiceReminders(today: Date = new Date()): Promise<DueServiceReminder[]> {
  const machines = await prisma.machine.findMany({
    where: { purchaseDate: { not: null } },
    include: {
      model: { include: { manufacturer: true, category: true } },
      ownerships: { where: { ownedUntil: null }, include: { customer: true } },
    },
  });

  const due: DueServiceReminder[] = [];

  for (const machine of machines) {
    const ownership = machine.ownerships[0];
    if (!ownership || ownership.customer.isDeleted) continue;

    const { recurringMonths, firstMonths } = resolveServiceIntervals(machine.model, machine.model.category);
    const { nextDueDate, alreadyNotifiedAt } = await resolveDueCycle(
      machine.id,
      machine.purchaseDate!,
      firstMonths,
      recurringMonths,
      today
    );
    const leadStart = subDays(nextDueDate, REMINDER_LEAD_DAYS);
    if (today < leadStart) continue; // inte dags än

    due.push({
      machineId: machine.id,
      customerId: ownership.customerId,
      customerName: ownership.customer.name,
      company: ownership.customer.company,
      phone: ownership.customer.phone,
      email: ownership.customer.email,
      manufacturerId: machine.model.manufacturerId,
      categoryId: machine.model.categoryId,
      modelId: machine.model.id,
      modelLabel: `${machine.model.manufacturer.name} ${machine.model.modelName}`,
      serialNumber: machine.serialNumber,
      purchaseYear: machine.purchaseDate ? machine.purchaseDate.getFullYear() : null,
      nextDueDate: nextDueDate.toISOString(),
      alreadyNotifiedAt: alreadyNotifiedAt?.toISOString() ?? null,
    });
  }

  return due;
}
