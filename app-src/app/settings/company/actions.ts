"use server";

import { revalidatePath } from "next/cache";
import { setCompanyProfileField, COMPANY_PROFILE_KEYS, type CompanyProfileField } from "@/lib/companyProfile";

/** Sparar företagsprofilen. Loggan skickas som en färdig data-URL (konverterad
 * client-side) — lämnas fältet tomt (inget nytt val gjort) rörs den
 * befintliga loggan inte, precis som hemliga fält i utskicksinställningarna. */
export async function updateCompanyProfile(formData: FormData) {
  for (const field of Object.keys(COMPANY_PROFILE_KEYS) as CompanyProfileField[]) {
    const raw = formData.get(field);
    const value = typeof raw === "string" ? raw.trim() : "";

    if (field === "companyLogoDataUrl" && !value) continue;

    await setCompanyProfileField(field, value);
  }

  revalidatePath("/settings/company");
}
