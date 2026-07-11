import { NextRequest, NextResponse } from "next/server";
import { restoreFromUpload } from "@/lib/backup";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Ingen fil vald" }, { status: 400 });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await restoreFromUpload(buffer);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
