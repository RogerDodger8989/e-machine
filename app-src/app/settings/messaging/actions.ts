"use server";

import { revalidatePath } from "next/cache";
import { setMessagingConfigField, MESSAGING_CONFIG_KEYS, type MessagingConfigField } from "@/lib/messaging/config";

const SECRET_FIELDS: MessagingConfigField[] = ["elksApiPassword", "mailercloudSmtpPassword"];

/**
 * Sparar utskicksuppgifterna. Hemliga fält (lösenord/API-nyckel) lämnas
 * alltid tomma i formuläret om ett värde redan finns sparat — skickas
 * fältet tomt in här rör vi INTE det befintliga värdet, bara ett ifyllt
 * fält skriver över. Övriga fält (företagsnamn, avsändare) sparas som de
 * är ifyllda, inklusive tomma (går att rensa).
 */
export async function updateMessagingConfig(formData: FormData) {
  for (const field of Object.keys(MESSAGING_CONFIG_KEYS) as MessagingConfigField[]) {
    const raw = formData.get(field);
    const value = typeof raw === "string" ? raw.trim() : "";

    if (SECRET_FIELDS.includes(field) && !value) continue;

    await setMessagingConfigField(field, value);
  }

  revalidatePath("/settings/messaging");
}
