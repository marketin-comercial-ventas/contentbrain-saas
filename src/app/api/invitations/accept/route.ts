import type { NextRequest, NextResponse } from "next/server";
import { auth, jsonError } from "@/modules/identity/http";
import { acceptInvitation } from "@/modules/invitations/service";
import { acceptInvitationSchema } from "@/shared/contracts/tenants";

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  const session = await auth(request);
  if (!session) {
    return jsonError(401, "UNAUTHENTICATED", "Sesión requerida");
  }

  const body = await request.json();
  const parsed = acceptInvitationSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "VALIDATION", "Token de invitación inválido");
  }

  try {
    const result = await acceptInvitation(parsed.data.token, session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Invalid") || error.message.includes("expired")) {
        return jsonError(400, "INVITATION_INVALID", error.message);
      }
      return jsonError(400, "INVITATION_FAILED", error.message);
    }
    return jsonError(500, "INTERNAL_ERROR", "Error interno del servidor");
  }
}