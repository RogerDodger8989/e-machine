import { NextRequest, NextResponse } from "next/server";
import { parseSpreadsheet } from "@/lib/import/parseSpreadsheet";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB — gott om marginal för ett kund-/produktregister

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Ingen fil vald" }, { status: 400 });
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "Filen är för stor (max 20 MB)" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = parseSpreadsheet(buffer);
    if (parsed.headers.length === 0) {
      return NextResponse.json({ error: "Ingen data hittades i filen — kontrollera att den inte är tom" }, { status: 400 });
    }
    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json(
      { error: `Kunde inte läsa filen: ${(e as Error).message}` },
      { status: 400 }
    );
  }
}
