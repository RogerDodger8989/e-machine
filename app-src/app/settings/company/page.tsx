import { Breadcrumbs } from "@/components/breadcrumbs";
import { CompanyProfileForm } from "@/components/company-profile-form";
import { getCompanyProfile } from "@/lib/companyProfile";

export const dynamic = "force-dynamic";

export default async function CompanyProfileSettingsPage() {
  const profile = await getCompanyProfile();

  return (
    <div className="max-w-xl space-y-4">
      <Breadcrumbs
        items={[
          { label: "Inställningar", href: "/settings" },
          { label: "Företagsuppgifter", href: "/settings/company" },
        ]}
      />
      <h1 className="text-2xl font-semibold">Företagsuppgifter</h1>
      <CompanyProfileForm profile={profile} />
    </div>
  );
}
