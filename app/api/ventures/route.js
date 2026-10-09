import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

const FILE = path.join(process.cwd(), "data", "ventures.json");

function read() {
  const raw = JSON.parse(fs.readFileSync(FILE, "utf8"));
  return raw.ventures || [];
}

export async function GET() {
  try {
    const ventures = read();
    return NextResponse.json({ count: ventures.length, ventures });
  } catch (e) {
    return NextResponse.json({ error: "could not read ventures store" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const ventures = body.ventures;
    if (!Array.isArray(ventures)) {
      return NextResponse.json({ error: "expected { ventures: [...] }" }, { status: 400 });
    }
    const cleaned = ventures.map((v) => ({
      id: String(v.id || "").trim() || "unnamed",
      name: String(v.name || "").trim() || "Unnamed",
      lane: String(v.lane || "—"),
      status: String(v.status || "—"),
      next_action: String(v.next_action || ""),
      mrr: Number(v.mrr) || 0,
      last_touched: String(v.last_touched || ""),
    }));
    fs.writeFileSync(
      FILE,
      JSON.stringify({ updated_at: new Date().toISOString(), ventures: cleaned }, null, 2),
      "utf8"
    );
    return NextResponse.json({ ok: true, count: cleaned.length });
  } catch (e) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }
}
