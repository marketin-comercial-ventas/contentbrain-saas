import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authorizeCompanyRequest, jsonError } from "@/modules/identity/http";
import { 
  getCompanyBrain, 
  upsertCompanyBrain,
  approveCompanyBrain,
  rejectCompanyBrain,
  getBrainVersions
} from "@/modules/company-brain/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const brain = await getCompanyBrain(companyId);
  return NextResponse.json({ brain });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const body = await request.json();
  const parsed = await import("@/shared/contracts/entities").then(m => m.updateCompanyBrainSchema.safeParse(body));
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  // Obtener el userId de la autorización para tracking
  const userId = authorization.userId;
  const brain = await upsertCompanyBrain(companyId, parsed.data, userId);
  return NextResponse.json({ brain }, { status: 201 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  const body = await request.json();
  const parsed = await import("@/shared/contracts/entities").then(m => m.updateCompanyBrainSchema.safeParse(body));
  if (!parsed.success) return jsonError(400, "VALIDATION", "Datos inválidos", parsed.error.flatten());

  // Obtener el userId de la autorización para tracking
  const userId = authorization.userId;
  const brain = await upsertCompanyBrain(companyId, parsed.data, userId);
  return NextResponse.json({ brain });
}

// Nuevos endpoints para aprobación y versiones
export async function POST_APPROVE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  
  const userId = authorization.userId;
  try {
    const result = await approveCompanyBrain(companyId, userId);
    return NextResponse.json(result);
  } catch (error: any) {
    return jsonError(400, "APPROVAL_ERROR", error.message);
  }
}

export async function POST_REJECT(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  
  try {
    const result = await rejectCompanyBrain(companyId);
    return NextResponse.json(result);
  } catch (error: any) {
    return jsonError(400, "REJECTION_ERROR", error.message);
  }
}

export async function GET_VERSIONS(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const { companyId } = await params;
  const authorization = await authorizeCompanyRequest(request, companyId);
  if (!authorization.ok) return authorization.response;
  
  const versions = await getBrainVersions(companyId);
  return NextResponse.json({ versions });
}
