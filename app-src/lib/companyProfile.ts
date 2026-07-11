import { getSetting, setSetting } from "@/lib/settings";

const KEYS = {
  // Samma nyckel som `lib/messaging/config.ts` använder för {{shop_name}} —
  // en enda källa för företagsnamnet oavsett var det redigeras.
  companyName: "messagingCompanyName",
  companyAddress: "companyAddress",
  companyPhone: "companyPhone",
  companyOrgNumber: "companyOrgNumber",
  // Data-URL (base64), sparas i settings-tabellen så loggan följer med i den
  // vanliga databas-backupen istället för att behöva egen filhantering.
  companyLogoDataUrl: "companyLogoDataUrl",
} as const;

export type CompanyProfileField = keyof typeof KEYS;

export interface CompanyProfile {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyOrgNumber: string;
  companyLogoDataUrl: string;
}

export async function getCompanyProfile(): Promise<CompanyProfile> {
  const entries = await Promise.all(
    (Object.keys(KEYS) as CompanyProfileField[]).map(async (field) => {
      const stored = await getSetting<string>(KEYS[field]);
      return [field, stored ?? ""] as const;
    })
  );
  return Object.fromEntries(entries) as unknown as CompanyProfile;
}

export async function setCompanyProfileField(field: CompanyProfileField, value: string): Promise<void> {
  await setSetting(KEYS[field], value);
}

export { KEYS as COMPANY_PROFILE_KEYS };
