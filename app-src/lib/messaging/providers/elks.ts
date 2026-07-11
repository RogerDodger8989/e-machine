import type { MessageProvider } from "@/lib/messaging/types";
import { getMessagingConfig } from "@/lib/messaging/config";

export interface ElksBalance {
  /** Saldo i tiotusendelar av kontots valuta (samma skala som `cost` i
   * 46elks SMS-svar) — dela med 10000 för det faktiska beloppet. */
  balance: number;
  currency: string;
}

/** SMS via 46elks (https://46elks.se/). Konfigureras under Inställningar →
 * Utskick (eller ELKS_API_USERNAME/PASSWORD/FROM i miljön som reservval). */
export class ElksProvider implements MessageProvider {
  async send(to: string, body: string): Promise<{ providerMessageId: string }> {
    const { elksApiUsername: username, elksApiPassword: password, elksFrom: from } = await getMessagingConfig();

    if (!username || !password || !from) {
      throw new Error("46elks är inte konfigurerat (ELKS_API_USERNAME/PASSWORD/FROM saknas)");
    }

    const auth = Buffer.from(`${username}:${password}`).toString("base64");
    const res = await fetch("https://api.46elks.com/a1/sms", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ from, to, message: body }).toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`46elks svarade ${res.status}: ${text}`);
    }

    const data = (await res.json()) as { id: string };
    return { providerMessageId: data.id };
  }

  async getBalance(): Promise<ElksBalance> {
    const { elksApiUsername: username, elksApiPassword: password } = await getMessagingConfig();
    if (!username || !password) {
      throw new Error("46elks är inte konfigurerat (ELKS_API_USERNAME/PASSWORD saknas)");
    }

    const auth = Buffer.from(`${username}:${password}`).toString("base64");
    const res = await fetch("https://api.46elks.com/a1/me", {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`46elks svarade ${res.status}: ${text}`);
    }

    const data = (await res.json()) as { balance: number; currency: string };
    return { balance: data.balance, currency: data.currency };
  }
}
