"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ALL = "all";

const STATUS_ITEMS: Record<string, string> = {
  [ALL]: "Alla",
  sent: "Skickat",
  failed: "Misslyckades",
  blocked: "Blockerat",
};
const CHANNEL_ITEMS: Record<string, string> = { [ALL]: "Alla", sms: "SMS", email: "E-post" };
const LEGAL_BASIS_ITEMS: Record<string, string> = {
  [ALL]: "Alla",
  service_reminder: "Servicepåminnelse",
  marketing: "Marknadsföring",
  order_ready: "Sms",
};

export function MessageLogFilters({
  status,
  channel,
  legalBasis,
  from,
  to,
}: {
  status: string;
  channel: string;
  legalBasis: string;
  from: string;
  to: string;
}) {
  const router = useRouter();
  const [statusValue, setStatusValue] = useState(status);
  const [channelValue, setChannelValue] = useState(channel);
  const [legalBasisValue, setLegalBasisValue] = useState(legalBasis);
  const [fromValue, setFromValue] = useState(from);
  const [toValue, setToValue] = useState(to);

  function apply(next: { status: string; channel: string; legalBasis: string; from: string; to: string }) {
    const params = new URLSearchParams();
    if (next.status !== ALL) params.set("status", next.status);
    if (next.channel !== ALL) params.set("channel", next.channel);
    if (next.legalBasis !== ALL) params.set("legalBasis", next.legalBasis);
    params.set("from", next.from);
    params.set("to", next.to);
    router.push(`/messages?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Status</Label>
        <Select
          value={statusValue}
          onValueChange={(v) => {
            if (!v) return;
            setStatusValue(v);
            apply({ status: v, channel: channelValue, legalBasis: legalBasisValue, from: fromValue, to: toValue });
          }}
          items={STATUS_ITEMS}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_ITEMS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Kanal</Label>
        <Select
          value={channelValue}
          onValueChange={(v) => {
            if (!v) return;
            setChannelValue(v);
            apply({ status: statusValue, channel: v, legalBasis: legalBasisValue, from: fromValue, to: toValue });
          }}
          items={CHANNEL_ITEMS}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(CHANNEL_ITEMS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Typ</Label>
        <Select
          value={legalBasisValue}
          onValueChange={(v) => {
            if (!v) return;
            setLegalBasisValue(v);
            apply({ status: statusValue, channel: channelValue, legalBasis: v, from: fromValue, to: toValue });
          }}
          items={LEGAL_BASIS_ITEMS}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LEGAL_BASIS_ITEMS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-end gap-2 sm:border-l sm:pl-3 sm:ml-1">
        <div className="space-y-1">
          <Label htmlFor="from-date" className="text-xs text-muted-foreground">
            Från
          </Label>
          <Input
            id="from-date"
            type="date"
            value={fromValue}
            onChange={(e) => setFromValue(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="to-date" className="text-xs text-muted-foreground">
            Till
          </Label>
          <Input
            id="to-date"
            type="date"
            value={toValue}
            onChange={(e) => setToValue(e.target.value)}
            className="w-40"
          />
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() =>
            apply({ status: statusValue, channel: channelValue, legalBasis: legalBasisValue, from: fromValue, to: toValue })
          }
        >
          Visa
        </Button>
      </div>
    </div>
  );
}
