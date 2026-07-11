import nodemailer from "nodemailer";
import type { MessageProvider } from "@/lib/messaging/types";
import { getMessagingConfig } from "@/lib/messaging/config";

/**
 * E-post via Mailercloud (https://www.mailercloud.com/). Mailercloud saknar
 * en publik REST-endpoint för att skicka ett enskilt transaktionsmeddelande
 * — deras dokumenterade väg för det är SMTP (värdnamn/port/användarnamn/
 * lösenord är kontospecifika, hämtas från Mailercloud-kontots
 * SMTP-integrationssida). Konfigureras under Inställningar → Utskick (eller
 * MAILERCLOUD_SMTP_* i miljön som reservval).
 */
export class MailercloudProvider implements MessageProvider {
  async send(to: string, body: string, subject?: string): Promise<{ providerMessageId: string }> {
    const {
      mailercloudSmtpHost: host,
      mailercloudSmtpPort: portRaw,
      mailercloudSmtpUsername: username,
      mailercloudSmtpPassword: password,
      mailercloudFromEmail: from,
    } = await getMessagingConfig();

    if (!host || !username || !password || !from) {
      throw new Error(
        "Mailercloud är inte konfigurerat (SMTP-värdnamn/användarnamn/lösenord/avsändaradress saknas)"
      );
    }

    const port = Number(portRaw) || 587;
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS
      auth: { user: username, pass: password },
      requireTLS: port !== 465,
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject: subject ?? "",
      text: body,
    });

    return { providerMessageId: info.messageId ?? "" };
  }
}
