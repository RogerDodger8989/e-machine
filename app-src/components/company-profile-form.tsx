"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { updateCompanyProfile } from "@/app/settings/company/actions";

export interface CompanyProfileView {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyOrgNumber: string;
  companyLogoDataUrl: string;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function CompanyProfileForm({ profile }: { profile: CompanyProfileView }) {
  const [companyName, setCompanyName] = useState(profile.companyName);
  const [companyAddress, setCompanyAddress] = useState(profile.companyAddress);
  const [companyPhone, setCompanyPhone] = useState(profile.companyPhone);
  const [companyOrgNumber, setCompanyOrgNumber] = useState(profile.companyOrgNumber);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState(profile.companyLogoDataUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setLogoDataUrl(dataUrl);
    setLogoPreview(dataUrl);
  }

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      const form = new FormData();
      form.set("companyName", companyName);
      form.set("companyAddress", companyAddress);
      form.set("companyPhone", companyPhone);
      form.set("companyOrgNumber", companyOrgNumber);
      form.set("companyLogoDataUrl", logoDataUrl ?? "");
      await updateCompanyProfile(form);
      setLogoDataUrl(null);
      setSaved(true);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Företagsuppgifter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Används på utskrivna kampanjblad (t.ex. hämt-/lämnserviceerbjudandet på en
          maskins sida) och som avsändarnamn i utskicksmallar.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="companyName">Företagsnamn</Label>
          <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="companyAddress">Adress</Label>
          <Textarea
            id="companyAddress"
            rows={2}
            value={companyAddress}
            onChange={(e) => setCompanyAddress(e.target.value)}
            placeholder={"Gatuadress\nPostnummer Ort"}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="companyPhone">Telefon</Label>
            <Input id="companyPhone" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="companyOrgNumber">Org.nr</Label>
            <Input
              id="companyOrgNumber"
              value={companyOrgNumber}
              onChange={(e) => setCompanyOrgNumber(e.target.value)}
              placeholder="XXXXXX-XXXX"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Logga</Label>
          <div className="flex items-center gap-3">
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreview} alt="Logga" className="h-12 w-auto rounded border bg-white p-1" />
            ) : (
              <span className="text-sm text-muted-foreground">Ingen logga uppladdad</span>
            )}
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              {logoPreview ? "Byt logga" : "Ladda upp logga"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Sparar…" : "Spara"}
          </Button>
          {saved && <p className="text-sm text-muted-foreground">Sparat.</p>}
        </div>
      </CardContent>
    </Card>
  );
}
