import { NextResponse } from "next/server";
import { createAdminSessionCookie, validateAdminCredentials } from "@/lib/admin/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    username?: string;
    accessCode?: string;
  } | null;

  if (!body?.username || !body?.accessCode) {
    return NextResponse.json({ error: "Identifiants requis." }, { status: 400 });
  }

  if (!validateAdminCredentials(body.username, body.accessCode)) {
    return NextResponse.json({ error: "Acces refuse." }, { status: 401 });
  }

  createAdminSessionCookie();

  return NextResponse.json({ ok: true });
}
