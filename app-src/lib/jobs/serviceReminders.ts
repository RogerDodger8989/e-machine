import { prisma } from "@/lib/db";
import { addMonths, subDays } from "@/lib/date";

// 60 dagar ≈ 2 månader ledtid: för en maskin med standardintervallet 12
// månader (1 år) blir den aktuell för påminnelse vid ~10 månader, så kunden
// hinner boka in service innan maskinen fyller 1 år.
const REMINDER_LEAD_DAYS = 60;

export interface DueCycle {
  nextDueDate: Date;
  alreadyNotifiedAt: Date | null;
}

/**
 * Räknar fram vilken servicecykel som är aktuell just nu genom att upprepa
 * inköpsdatum + serviceintervall — det finns ingen egen registrering av
 * "utförd service" i appen, så inköpsdatumet är den enda fasta ankarpunkten
 * att räkna cykler ifrån. En cykel vars förfallodatum redan passerat räknas
 * bara som klar (och cykeln flyttas fram) om en påminnelse faktiskt skickats
 * eller blockerats under den cykeln — annars fortsätter maskinen att visas
 * som (allt mer) försenad istället för att tyst hoppa fram ett helt år.
 */
export async function resolveDueCycle(
  machineId: string,
  purchaseDate: Date,
  intervalMonths: number,
  today: Date
): Promise<DueCycle> {
  let due = addMonths(purchaseDate, intervalMonths);

  while (true) {
    const cycleStart = addMonths(due, -intervalMonths);
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
      due = addMonths(due, intervalMonths);
      continue;
    }

    return { nextDueDate: due, alreadyNotifiedAt: reminded?.createdAt ?? null };
  }
}

export interface DueServiceReminder {
  machineId: string;
  customerId: string;
  customerName: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  modelLabel: string;
  serialNumber: string;
  nextDueDate: string; // ISO
  alreadyNotifiedAt: string | null; // ISO, senaste service_reminder-utskick i denna cykel
}

/**
 * Beräknar vilka maskiner som är aktuella för en servicepåminnelse just nu —
 * skickar inget, bara listar kandidater för manuell granskning (se
 * app/settings/service-reminders). "Redan påmind" avgörs av om det redan
 * finns en service_reminder-logg sedan innevarande cykel startade, men det
 * filtrerar INTE bort raden — det är upp till den som skickar att avgöra,
 * med säkerhetsnätet i sendServiceReminders som skyddar mot dubblett.
 */
export async function getDueServiceReminders(today: Date = new Date()): Promise<DueServiceReminder[]> {
  const machines = await prisma.machine.findMany({
    where: { purchaseDate: { not: null } },
    include: {
      model: true,
      ownerships: { where: { ownedUntil: null }, include: { customer: true } },
    },
  });

  const due: DueServiceReminder[] = [];

  for (const machine of machines) {
    const ownership = machine.ownerships[0];
    if (!ownership || ownership.customer.isDeleted) continue;

    const { nextDueDate, alreadyNotifiedAt } = await resolveDueCycle(
      machine.id,
      machine.purchaseDate!,
      machine.model.standardServiceIntervalMonths,
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
      modelLabel: `${machine.model.manufacturer} ${machine.model.modelName}`,
      serialNumber: machine.serialNumber,
      nextDueDate: nextDueDate.toISOString(),
      alreadyNotifiedAt: alreadyNotifiedAt?.toISOString() ?? null,
    });
  }

  return due;
}
