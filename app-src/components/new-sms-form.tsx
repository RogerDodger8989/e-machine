"use client";

import { useState, useTransition } from "react";
import { sendSms } from "@/app/sms/actions";
import { analyzeSmsBody } from "@/lib/sms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface SmsTemplateOption {
  key: string;
  name: string;
  body: string;
}

const NO_TEMPLATE = "none";

export function NewSmsForm({ templates }: { templates: SmsTemplateOption[] }) {
  const [message, setMessage] = useState("");
  const [templateKey, setTemplateKey] = useState(NO_TEMPLATE);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const stats = analyzeSmsBody(message);

  function handleTemplateChange(key: string) {
    setTemplateKey(key);
    const template = templates.find((t) => t.key === key);
    setMessage(template ? template.body : "");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await sendSms(formData);
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
        setMessage("");
        setTemplateKey(NO_TEMPLATE);
      } catch (err) {
        setError((err as Error).message);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skicka SMS</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber">Telefonnummer *</Label>
            <Input id="phoneNumber" name="phoneNumber" type="tel" required placeholder="07XXXXXXXX" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="articleDescription">Vara/artikel *</Label>
            <Input
              id="articleDescription"
              name="articleDescription"
              required
              placeholder="t.ex. Kedja till Stihl MS 251"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amountDue">Summa att betala (kr)</Label>
            <Input id="amountDue" name="amountDue" type="number" min={0} step={1} placeholder="t.ex. 450" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="templateKey">Välj mall</Label>
            <Select
              value={templateKey}
              onValueChange={(v) => v && handleTemplateChange(v)}
              items={{ [NO_TEMPLATE]: "Eget meddelande", ...Object.fromEntries(templates.map((t) => [t.key, t.name])) }}
            >
              <SelectTrigger id="templateKey" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_TEMPLATE}>Eget meddelande</SelectItem>
                {templates.map((t) => (
                  <SelectItem key={t.key} value={t.key}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="templateKey" value={templateKey === NO_TEMPLATE ? "" : templateKey} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Meddelande *</Label>
            <Textarea
              id="message"
              name="message"
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hej! Din vara är nu klar för hämtning. Välkommen!"
            />
            <p className={`text-xs ${stats.segments > 1 ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground"}`}>
              {stats.length} tecken · {stats.encoding} ·{" "}
              {stats.segments <= 1 ? "1 sms" : `${stats.segments} sms (meddelandet delas upp)`}
            </p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Skickar…" : "Skicka SMS"}
            </Button>
            {success && <p className="text-sm text-muted-foreground">Skickat.</p>}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
