import { Breadcrumbs } from "@/components/breadcrumbs";
import { MessagingConfigForm, type MessagingConfigView } from "@/components/messaging-config-form";
import { getMessagingConfig } from "@/lib/messaging/config";

export const dynamic = "force-dynamic";

export default async function MessagingSettingsPage() {
  const config = await getMessagingConfig();

  // Hemliga fält skickas ALDRIG i klartext till klienten — bara om ett
  // värde är satt eller ej, så formuläret vet vilken placeholder/hjälptext
  // det ska visa utan att avslöja lösenordet/nyckeln i sidans HTML.
  const view: MessagingConfigView = {
    companyName: config.companyName,
    elksApiUsername: config.elksApiUsername,
    elksFrom: config.elksFrom,
    elksPasswordSet: Boolean(config.elksApiPassword),
    mailercloudSmtpHost: config.mailercloudSmtpHost,
    mailercloudSmtpPort: config.mailercloudSmtpPort,
    mailercloudSmtpUsername: config.mailercloudSmtpUsername,
    mailercloudSmtpPasswordSet: Boolean(config.mailercloudSmtpPassword),
    mailercloudFromEmail: config.mailercloudFromEmail,
  };

  return (
    <div className="max-w-xl space-y-4">
      <Breadcrumbs
        items={[
          { label: "Inställningar", href: "/settings" },
          { label: "Utskick", href: "/settings/messaging" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Utskick</h1>
      <p className="text-sm text-muted-foreground">
        Uppgifterna nedan används för att skicka servicepåminnelser och kampanjer via SMS
        och e-post.
      </p>
      <MessagingConfigForm config={view} />
    </div>
  );
}
