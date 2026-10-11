import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/modules/identity/http";
import { acceptInvitation } from "@/modules/companies/service";
import { acceptInvitationSchema } from "@/shared/contracts/tenants";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = acceptInvitationSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Token inválido");

  const result = await acceptInvitation(parsed.data.token);
  if (!result) {
    return jsonError(400, "INVALID_TOKEN", "Invitación inválida, caducada o ya utilizada");
  }

  return NextResponse.json({ ok: true, companyId: result.companyId, role: result.role });
}