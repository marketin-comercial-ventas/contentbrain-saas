import { db } from "@/server/db/client";
import { invitations, type Invitation, type NewInvitation, memberships } from "@/server/db/schema";
import { eq, and, inArray, gt } from "drizzle-orm";
import { hash, compare } from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export async function createInvitation(companyId: string, data: Omit<NewInvitation, "id" | "companyId">, inviterId: string): Promise<{ invitation: Invitation; devToken?: string }> {
  // Generate a random token
  const token = uuidv4();
  const tokenHash = await hash(token, 10);

  // Set expiration to 48 hours from now
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48);

  // Start a transaction to ensure consistency
  const result = await db.transaction(async (tx) => {
    // Create the invitation
    const [invitation] = await tx.insert(invitations).values({
      companyId,
      ...data,
      tokenHash,
      expiresAt,
      inviterId,
    }).returning();

    // In development, return the token for testing (in production, this should be sent via email)
    // We'll return it as devToken only in non-production environments
    const devToken = process.env.NODE_ENV !== "production" ? token : undefined;

    return { invitation, devToken };
  });

  return result;
}

export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  // We need to find the invitation by comparing the token with the hash
  // Since we can't query by hash directly, we'll fetch all unexpired invitations and compare
  // This is not efficient for large numbers, but for now we assume low volume.
  // A better approach would be to store the token hash and use a lookup table, but we'll keep it simple for now.
  const now = new Date();
  const potentialInvitations = await db
    .select()
    .from(invitations)
    .where(and(
      gt(invitations.expiresAt, now), // Not expired
      eq(invitations.usedAt, null)        // Not used
    ));

  for (const inv of potentialInvitations) {
    const match = await compare(token, inv.tokenHash);
    if (match) {
      return inv;
    }
  }

  return null;
}

export async function acceptInvitation(token: string, userId: string): Promise<{ ok: boolean; companyId: string }> {
  const invitation = await getInvitationByToken(token);
  if (!invitation) {
    throw new Error("Invalid or expired invitation");
  }

  // Check if already used
  if (invitation.usedAt !== null) {
    throw new Error("Invitation already used");
  }

  // Check if expired
  if (gt(invitation.expiresAt, new Date())) {
    throw new Error("Invitation expired");
  }

  // Start a transaction to create membership and mark invitation as used
  await db.transaction(async (tx) => {
    // Create membership
    await tx.insert(memberships).values({
      userId,
      companyId: invitation.companyId,
      role: invitation.role,
    });

    // Mark invitation as used
    await tx.update(invitations)
      .set({ usedAt: new Date() })
      .where(eq(invitations.id, invitation.id));
  });

  return { ok: true, companyId: invitation.companyId };
}

export async function getInvitationsByCompany(companyId: string): Promise<Invitation[]> {
  return db
    .select()
    .from(invitations)
    .where(eq(invitations.companyId, companyId))
    .orderBy(desc(invitations.createdAt));
}

export async function revokeInvitation(id: string, companyId: string, userId: string): Promise<boolean> {
  // Only owner or admin can revoke
  const membership = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, userId),
        eq(memberships.companyId, companyId),
        inArray(memberships.role, ["owner", "admin"])
      )
    );

  if (membership.length === 0) {
    return false; // Not authorized
  }

  const result = await db
    .delete(invitations)
    .where(and(
      eq(invitations.id, id),
      eq(invitations.companyId, companyId)
    ));

  return (result.rowsAffected ?? 0) > 0;
}