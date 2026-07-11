import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomersTable, type CustomerRow } from "@/components/customers-table";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    take: 1000,
    select: {
      id: true,
      name: true,
      company: true,
      phone: true,
      email: true,
      marketingConsent: true,
      ownerships: {
        where: { ownedUntil: null },
        select: { machine: { select: { createdAt: true } } },
      },
      messageLogs: {
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const rows: CustomerRow[] = customers.map((c) => {
    const registrationDates = c.ownerships.map((o) => o.machine.createdAt.getTime());
    return {
      id: c.id,
      name: c.name,
      company: c.company,
      phone: c.phone,
      email: c.email,
      marketingConsent: c.marketingConsent,
      machineCount: c.ownerships.length,
      latestRegistration:
        registrationDates.length > 0 ? new Date(Math.max(...registrationDates)).toISOString() : null,
      latestOutreach: c.messageLogs[0]?.createdAt.toISOString() ?? null,
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kunder</h1>
        <Button nativeButton={false} render={<Link href="/customers/new">Ny kund</Link>} />
      </div>

      <Card>
        <CardContent className="p-0">
          <CustomersTable customers={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
