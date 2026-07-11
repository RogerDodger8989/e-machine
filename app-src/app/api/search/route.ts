import { NextRequest, NextResponse } from "next/server";
import { globalSearch } from "@/lib/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const results = await globalSearch(q);
  return NextResponse.json({ results });
}
