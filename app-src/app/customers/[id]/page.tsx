import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AnonymizeCustomerButton } from "@/components/anonymize-customer-button";
import { MessageLogTable } from "@/components/message-log-table";
import { MailtoLink } from "@/components/mailto-link";
import { CopyButton } from "@/components/copy-button";
import { CustomerNotesCard } from "@/components/customer-notes-card";
import { CustomerSendCard } from "@/components/customer-send-card";
import { getResendEligibility } from "@/lib/messaging/resend";
import { getCompanyProfile } from "@/lib/companyProfile";
import { Pencil, Printer } from "lucide-react";

export const dynamic = "force-dynamic";

const SERVICE_STATUS_LABEL: Record<string, string> = {
  sent: "skickat",
  blocked: "blockerat",
  failed: "misslyckades",
};

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [customer, sendableTemplates, company] = await Promise.all([
    prisma.customer.findUnique({
      where: { id },
      include: {
        ownerships: {
          orderBy: { ownedFrom: "desc" },
          include: {
            machine: {
              include: {
                model: {
                  include: {
                    manufacturer: true,
                    campaignSheetLinks: {
                      where: { template: { isActive: true } },
                      select: { template: { select: { key: true } } },
                    },
                  },
                },
                messageLogs: {
                  where: { legalBasis: "service_reminder" },
                  orderBy: { createdAt: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
        messageLogs: { orderBy: { createdAt: "desc" }, include: { retries: { select: { id: true } } } },
      },
    }),
    prisma.messageTemplate.findMany({
      where: { legalBasis: { in: ["marketing", "campaign_sheet"] }, isActive: true },
      select: { key: true, legalBasis: true, body: true },
      orderBy: [{ legalBasis: "asc" }, { key: "asc" }],
    }),
    getCompanyProfile(),
  ]);

  if (!customer) notFound();

  const activeOwnerships = customer.ownerships.filter((o) => o.ownedUntil === null);
  const pastOwnerships = customer.ownerships.filter((o) => o.ownedUntil !== null);
  const sendableMachines = activeOwnerships.map((o) => ({
    id: o.machine.id,
    label: `${o.machine.model.manufacturer.name} ${o.machine.model.modelName}`,
    serialNumber: o.machine.serialNumber,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{customer.name}</h1>
          {customer.isDeleted && (
            <Badge variant="secondary" className="mt-1">
              Anonymiserad {customer.anonymizedAt?.toLocaleDateString("sv-SE")}
            </Badge>
          )}
        </div>
        {!customer.isDeleted && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={`/customers/${customer.id}/edit`}>Redigera</Link>}
            />
            <AnonymizeCustomerButton customerId={customer.id} />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kontaktuppgifter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {customer.company && (
              <div>
                <span className="text-muted-foreground">Företag: </span>
                {customer.company}
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Telefon: </span>
              {customer.phone ?? "—"}
            </div>
            <div>
              <span className="text-muted-foreground">E-post: </span>
              {customer.email ? <MailtoLink email={customer.email} /> : "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Adress: </span>
              {customer.address || customer.postalCode || customer.city
                ? [customer.address, [customer.postalCode, customer.city].filter(Boolean).join(" ")]
                    .filter(Boolean)
                    .join(", ")
                : "—"}
            </div>
            <div>
              <span className="text-muted-foreground">Samtycke utskick: </span>
              {customer.marketingConsent ? (
                <Badge>Ja, sedan {customer.marketingConsentAt?.toLocaleDateString("sv-SE")}</Badge>
              ) : (
                <Badge variant="secondary">Nej</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Maskiner ({activeOwnerships.length})</CardTitle>
            {!customer.isDeleted && (
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={`/machines/new?customerId=${customer.id}`}>Lägg till maskin</Link>}
              />
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {activeOwnerships.length === 0 && (
              <p className="text-sm text-muted-foreground">Inga registrerade maskiner.</p>
            )}
            {activeOwnerships.map((o) => {
              const lastReminder = o.machine.messageLogs[0];
              return (
                <div
                  key={o.id}
                  className="flex items-start justify-between gap-3 rounded-md border p-3 text-sm hover:bg-muted"
                >
                  <Link href={`/machines/${o.machine.id}`} className="flex-1">
                    <div className="font-medium">
                      {o.machine.model.manufacturer.name} {o.machine.model.modelName}
                    </div>
                    <div className="text-muted-foreground inline-flex items-center gap-1">
                      Serienr: {o.machine.serialNumber}
                      <CopyButton
                        value={o.machine.serialNumber}
                        copiedMessage="Serienummer kopierat"
                        ariaLabel="Kopiera serienummer"
                      />
                    </div>
                    <div className="text-muted-foreground text-xs mt-1">
                      Senaste service-utskick:{" "}
                      {lastReminder
                        ? `${lastReminder.createdAt.toLocaleDateString("sv-SE")} · ${
                            SERVICE_STATUS_LABEL[lastReminder.status] ?? lastReminder.status
                          }`
                        : "inget skickat än"}
                    </div>
                  </Link>
                  <div className="text-muted-foreground text-xs whitespace-nowrap shrink-0 text-right space-y-1">
                    <div>Registrerad {o.machine.createdAt.toLocaleDateString("sv-SE")}</div>
                    <div>
                      Garanti t.o.m.{" "}
                      {o.machine.warrantyEndDate ? o.machine.warrantyEndDate.toLocaleDateString("sv-SE") : "—"}
                    </div>
                    <div className="flex justify-end gap-1">
                      {o.machine.model.campaignSheetLinks.length > 0 && (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                variant="outline"
                                size="icon-sm"
                                nativeButton={false}
                                render={
                                  <Link href={`/machines/${o.machine.id}/campaign-sheet`} aria-label="Skriv ut kampanjblad">
                                    <Printer />
                                  </Link>
                                }
                              />
                            }
                          />
                          <TooltipContent>
                            Skriv ut kampanjblad:{" "}
                            {o.machine.model.campaignSheetLinks.map((l) => l.template.key).join(", ")}
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Button
                        variant="outline"
                        size="icon-sm"
                        nativeButton={false}
                        render={
                          <Link href={`/machines/${o.machine.id}/edit`} title="Redigera maskin" aria-label="Redigera maskin">
                            <Pencil />
                          </Link>
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {pastOwnerships.length > 0 && (
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer">
                  {pastOwnerships.length} tidigare ägda maskiner
                </summary>
                <div className="mt-2 space-y-2">
                  {pastOwnerships.map((o) => (
                    <div key={o.id} className="rounded-md border p-2">
                      {o.machine.model.manufacturer.name} {o.machine.model.modelName} —{" "}
                      {o.machine.serialNumber} ({o.unlinkReason ?? "frikopplad"})
                    </div>
                  ))}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      </div>

      <CustomerNotesCard customerId={customer.id} notes={customer.notes ?? ""} />

      {!customer.isDeleted && (
        <CustomerSendCard
          customerId={customer.id}
          customerName={customer.name}
          hasEmail={!!customer.email}
          hasConsent={customer.marketingConsent}
          shopName={company.companyName || "Verkstaden"}
          machines={sendableMachines}
          templates={sendableTemplates}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Utskicksregister</CardTitle>
        </CardHeader>
        <CardContent>
          <MessageLogTable
            logs={customer.messageLogs.map((log) => {
              const { canResend, reason } = getResendEligibility(log, customer.isDeleted);
              return {
                ...log,
                canResend,
                resendDisabledReason: reason,
                wasRetried: log.retries.length > 0,
              };
            })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
