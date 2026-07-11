import { NextResponse } from "next/server";
import { ElksProvider } from "@/lib/messaging/providers/elks";
import { getMessagingConfig } from "@/lib/messaging/config";

export const runtime = "nodejs";

interface BalanceEntry {
  ok: boolean;
  label?: string;
  error?: string;
}

interface BalanceResponse {
  elks: BalanceEntry | null;
}

/** Hämtar aktuellt saldo hos 46elks för visning i navigeringen. Mailercloud
 * har ingen dokumenterad publik endpoint för kontosaldo/krediter, så bara
 * 46elks kan visas här. Anropas endast klientsidan efter sidladdning (inte
 * vid server-rendering) så externa API-anrop aldrig gör sidnavigering
 * långsammare. */
export async function GET() {
  const config = await getMessagingConfig();
  const result: BalanceResponse = { elks: null };

  if (config.elksApiUsername && config.elksApiPassword) {
    try {
      const { balance, currency } = await new ElksProvider().getBalance();
      result.elks = { ok: true, label: `${(balance / 10000).toFixed(2)} ${currency}` };
    } catch (e) {
      result.elks = { ok: false, error: (e as Error).message };
    }
  }

  return NextResponse.json(result);
}
