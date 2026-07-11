"use client";

import { useState } from "react";
import { createMessageTemplate } from "@/app/settings/templates/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageBodyField } from "@/components/message-body-field";

export function NewTemplateForm() {
  const [channel, setChannel] = useState("sms");

  return (
    <form action={createMessageTemplate} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="key">Nyckel *</Label>
        <Input id="key" name="key" required placeholder="t.ex. service_reminder" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="channel">Kanal *</Label>
          <Select
            name="channel"
            required
            value={channel}
            onValueChange={(v) => v && setChannel(v)}
            items={{ sms: "SMS", email: "E-post" }}
          >
            <SelectTrigger id="channel" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="email">E-post</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="legalBasis">Rättslig grund *</Label>
          <Select
            name="legalBasis"
            required
            defaultValue="service_reminder"
            items={{
              service_reminder: "Servicepåminnelse",
              marketing: "Marknadsföring",
              order_ready: "Sms",
            }}
          >
            <SelectTrigger id="legalBasis" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="service_reminder">Servicepåminnelse</SelectItem>
              <SelectItem value="marketing">Marknadsföring</SelectItem>
              <SelectItem value="order_ready">Sms</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="subject">Ämne (endast e-post)</Label>
        <Input id="subject" name="subject" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="body">Text *</Label>
        <MessageBodyField showSmsCounter={channel === "sms"} />
      </div>
      <Button type="submit">Spara mall</Button>
    </form>
  );
}
