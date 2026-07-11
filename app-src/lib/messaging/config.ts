import { getSetting, setSetting } from "@/lib/settings";

const KEYS = {
  companyName: "messagingCompanyName",
  elksApiUsername: "elksApiUsername",
  elksApiPassword: "elksApiPassword",
  elksFrom: "elksFrom",
  mailercloudSmtpHost: "mailercloudSmtpHost",
  mailercloudSmtpPort: "mailercloudSmtpPort",
  mailercloudSmtpUsername: "mailercloudSmtpUsername",
  mailercloudSmtpPassword: "mailercloudSmtpPassword",
  mailercloudFromEmail: "mailercloudFromEmail",
} as const;

export type MessagingConfigField = keyof typeof KEYS;

const ENV_FALLBACK: Record<MessagingConfigField, string> = {
  companyName: "COMPANY_NAME",
  elksApiUsername: "ELKS_API_USERNAME",
  elksApiPassword: "ELKS_API_PASSWORD",
  elksFrom: "ELKS_FROM",
  mailercloudSmtpHost: "MAILERCLOUD_SMTP_HOST",
  mailercloudSmtpPort: "MAILERCLOUD_SMTP_PORT",
  mailercloudSmtpUsername: "MAILERCLOUD_SMTP_USERNAME",
  mailercloudSmtpPassword: "MAILERCLOUD_SMTP_PASSWORD",
  mailercloudFromEmail: "MAILERCLOUD_FROM_EMAIL",
};

export interface MessagingConfig {
  companyName: string;
  elksApiUsername: string;
  elksApiPassword: string;
  elksFrom: string;
  mailercloudSmtpHost: string;
  mailercloudSmtpPort: string;
  mailercloudSmtpUsername: string;
  mailercloudSmtpPassword: string;
  mailercloudFromEmail: string;
}

/**
 * Sparade värden i `settings`-tabellen (via Inställningar → Utskick) tar
 * företräde framför miljövariabler — `.env` fortsätter fungera som
 * reservval för den som föredrar det, men gränssnittet är den nya
 * primära vägen.
 */
export async function getMessagingConfig(): Promise<MessagingConfig> {
  const entries = await Promise.all(
    (Object.keys(KEYS) as MessagingConfigField[]).map(async (field) => {
      const stored = await getSetting<string>(KEYS[field]);
      return [field, stored || process.env[ENV_FALLBACK[field]] || ""] as const;
    })
  );
  return Object.fromEntries(entries) as unknown as MessagingConfig;
}

export async function setMessagingConfigField(field: MessagingConfigField, value: string): Promise<void> {
  await setSetting(KEYS[field], value);
}

export { KEYS as MESSAGING_CONFIG_KEYS };
