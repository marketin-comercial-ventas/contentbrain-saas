import { NextRequest, NextResponse } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { createInvitation } from "@/modules/companies/service";
import { newInvitationSchema } from "@/shared/contracts/tenants";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId, "admin");
  if (authorization.ok === false) return authorization.response;

  const body = await request.json();
  const parsed = newInvitationSchema.safeParse(body);
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos");

  try {
    const { invitation, token } = await createInvitation(
      companyId,
      parsed.data.email,
      parsed.data.role,
      authorization.session.user.id
    );
    // devToken solo en desarrollo/preview
    const devToken = process.env.NODE_ENV !== "production" ? token : undefined;
    return NextResponse.json({ invitation, devToken }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear invitación";
    return jsonError(400, "INVITATION_FAILED", message);
  }
}