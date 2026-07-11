"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateMessagingConfig } from "@/app/settings/messaging/actions";
import { isValidAlphanumericSender } from "@/lib/sms";

export interface MessagingConfigView {
  companyName: string;
  elksApiUsername: string;
  elksFrom: string;
  elksPasswordSet: boolean;
  mailercloudSmtpHost: string;
  mailercloudSmtpPort: string;
  mailercloudSmtpUsername: string;
  mailercloudSmtpPasswordSet: boolean;
  mailercloudFromEmail: string;
}

export function MessagingConfigForm({ config }: { config: MessagingConfigView }) {
  const [companyName, setCompanyName] = useState(config.companyName);
  const [elksApiUsername, setElksApiUsername] = useState(config.elksApiUsername);
  const [elksApiPassword, setElksApiPassword] = useState("");
  const [elksFrom, setElksFrom] = useState(config.elksFrom);
  const [elksPasswordSet, setElksPasswordSet] = useState(config.elksPasswordSet);

  const [mailercloudSmtpHost, setMailercloudSmtpHost] = useState(config.mailercloudSmtpHost);
  const [mailercloudSmtpPort, setMailercloudSmtpPort] = useState(config.mailercloudSmtpPort || "587");
  const [mailercloudSmtpUsername, setMailercloudSmtpUsername] = useState(config.mailercloudSmtpUsername);
  const [mailercloudSmtpPassword, setMailercloudSmtpPassword] = useState("");
  const [mailercloudFromEmail, setMailercloudFromEmail] = useState(config.mailercloudFromEmail);
  const [mailercloudSmtpPasswordSet, setMailercloudSmtpPasswordSet] = useState(config.mailercloudSmtpPasswordSet);

  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const elksConfigured = Boolean(elksApiUsername && elksPasswordSet && elksFrom);
  const mailercloudConfigured = Boolean(
    mailercloudSmtpHost && mailercloudSmtpUsername && mailercloudSmtpPasswordSet && mailercloudFromEmail
  );

  const elksFromTrimmed = elksFrom.trim();
  const looksLikePhoneNumber = /^\+?[0-9\s-]+$/.test(elksFromTrimmed);
  const elksFromValid = !elksFromTrimmed || looksLikePhoneNumber || isValidAlphanumericSender(elksFromTrimmed);

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      const form = new FormData();
      form.set("companyName", companyName);
      form.set("elksApiUsername", elksApiUsername);
      form.set("elksApiPassword", elksApiPassword);
      form.set("elksFrom", elksFrom);
      form.set("mailercloudSmtpHost", mailercloudSmtpHost);
      form.set("mailercloudSmtpPort", mailercloudSmtpPort);
      form.set("mailercloudSmtpUsername", mailercloudSmtpUsername);
      form.set("mailercloudSmtpPassword", mailercloudSmtpPassword);
      form.set("mailercloudFromEmail", mailercloudFromEmail);
      await updateMessagingConfig(form);
      if (elksApiPassword) setElksPasswordSet(true);
      if (mailercloudSmtpPassword) setMailercloudSmtpPasswordSet(true);
      setElksApiPassword("");
      setMailercloudSmtpPassword("");
      setSaved(true);
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Företagsuppgifter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <Label htmlFor="companyName">Företagsnamn</Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="t.ex. ÖsterlenExperten"
          />
          <p className="text-xs text-muted-foreground">
            Används som avsändarnamn i utskicksmallar (variabeln {"{{shop_name}}"}).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>SMS (46elks)</CardTitle>
          <Badge variant={elksConfigured ? "default" : "secondary"}>
            {elksConfigured ? "Konfigurerat" : "Inte konfigurerat"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Skapa ett konto och hämta API-uppgifter på{" "}
            <a
              href="https://46elks.se"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              46elks.se
            </a>
            .
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="elksApiUsername">API-användarnamn</Label>
            <Input
              id="elksApiUsername"
              value={elksApiUsername}
              onChange={(e) => setElksApiUsername(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="elksApiPassword">API-lösenord</Label>
            <Input
              id="elksApiPassword"
              type="password"
              value={elksApiPassword}
              onChange={(e) => setElksApiPassword(e.target.value)}
              placeholder={elksPasswordSet ? "••••••••" : ""}
            />
            {elksPasswordSet && (
              <p className="text-xs text-muted-foreground">
                Lämna tomt för att behålla nuvarande lösenord.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="elksFrom">Avsändare</Label>
            <Input
              id="elksFrom"
              value={elksFrom}
              onChange={(e) => setElksFrom(e.target.value)}
              placeholder="t.ex. företagsnamn eller telefonnummer"
              aria-invalid={!elksFromValid}
            />
            <p className={`text-xs ${elksFromValid ? "text-muted-foreground" : "text-destructive"}`}>
              {elksFromValid
                ? "Namnet eller numret mottagaren ser som avsändare. Om det är ett namn (inte telefonnummer): max 11 tecken, endast A–Z/a–z och siffror — inte å/ä/ö."
                : `Ogiltig avsändare (${elksFromTrimmed.length}/11 tecken) — namn får bara innehålla A–Z/a–z och siffror (inte å/ä/ö), max 11 tecken. Telefonnummer (t.ex. +46701234567) fungerar också.`}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>E-post (Mailercloud)</CardTitle>
          <Badge variant={mailercloudConfigured ? "default" : "secondary"}>
            {mailercloudConfigured ? "Konfigurerat" : "Inte konfigurerat"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Skapa ett konto på{" "}
            <a
              href="https://www.mailercloud.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              mailercloud.com
            </a>{" "}
            och hämta SMTP-uppgifterna under kontots SMTP-integration.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="mailercloudSmtpHost">SMTP-värdnamn</Label>
              <Input
                id="mailercloudSmtpHost"
                value={mailercloudSmtpHost}
                onChange={(e) => setMailercloudSmtpHost(e.target.value)}
                placeholder="t.ex. smtp.mailercloud.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mailercloudSmtpPort">Port</Label>
              <Input
                id="mailercloudSmtpPort"
                type="number"
                value={mailercloudSmtpPort}
                onChange={(e) => setMailercloudSmtpPort(e.target.value)}
                placeholder="587"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mailercloudSmtpUsername">SMTP-användarnamn</Label>
            <Input
              id="mailercloudSmtpUsername"
              value={mailercloudSmtpUsername}
              onChange={(e) => setMailercloudSmtpUsername(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mailercloudSmtpPassword">SMTP-lösenord</Label>
            <Input
              id="mailercloudSmtpPassword"
              type="password"
              value={mailercloudSmtpPassword}
              onChange={(e) => setMailercloudSmtpPassword(e.target.value)}
              placeholder={mailercloudSmtpPasswordSet ? "••••••••" : ""}
            />
            {mailercloudSmtpPasswordSet && (
              <p className="text-xs text-muted-foreground">
                Lämna tomt för att behålla nuvarande lösenord.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mailercloudFromEmail">Avsändaradress</Label>
            <Input
              id="mailercloudFromEmail"
              type="email"
              value={mailercloudFromEmail}
              onChange={(e) => setMailercloudFromEmail(e.target.value)}
              placeholder="t.ex. info@dittforetag.se"
            />
            <p className="text-xs text-muted-foreground">
              Måste vara en verifierad avsändaradress i Mailercloud.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? "Sparar…" : "Spara"}
        </Button>
        {saved && <p className="text-sm text-muted-foreground">Sparat.</p>}
      </div>
    </div>
  );
}
