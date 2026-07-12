import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewCustomerForm } from "@/components/new-customer-form";

export default function NewCustomerPage() {
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold">Ny kund</h1>

      <Card>
        <CardHeader>
          <CardTitle>Kunduppgifter</CardTitle>
        </CardHeader>
        <CardContent>
          <NewCustomerForm />
        </CardContent>
      </Card>
    </div>
  );
}
