"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { analyzeSmsBody } from "@/lib/sms";

export function MessageBodyField({
  defaultValue = "",
  showSmsCounter,
}: {
  defaultValue?: string;
  showSmsCounter: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const stats = showSmsCounter ? analyzeSmsBody(value) : null;

  return (
    <div className="space-y-1.5">
      <Textarea
        id="body"
        name="body"
        rows={5}
        required
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Hej {{customer_name}}! Dags för service på din {{model_name}} (serienr {{serial_number}}). Hälsningar {{shop_name}}"
      />
      {stats && (
        <p className={`text-xs ${stats.segments > 1 ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground"}`}>
          {stats.length} tecken · {stats.encoding} ({stats.singleLimit} tecken/sms) ·{" "}
          {stats.segments <= 1 ? "1 sms" : `${stats.segments} sms (meddelandet delas upp)`}
          {stats.encoding === "UCS-2" &&
            " — innehåller tecken utanför SMS-standardalfabetet (t.ex. emoji), vilket ger en kortare gräns."}
          {" "}Uppskattning baserat på mallens text — variabler (t.ex. {"{{customer_name}}"}) kan göra det
          faktiska meddelandet längre.
        </p>
      )}
    </div>
  );
}
