import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditCustomerForm } from "@/components/edit-customer-form";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer || customer.isDeleted) notFound();

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Redigera kund</h1>

      <Card>
        <CardHeader>
          <CardTitle>Kunduppgifter</CardTitle>
        </CardHeader>
        <CardContent>
          <EditCustomerForm customer={customer} />
        </CardContent>
      </Card>
    </div>
  );
}
