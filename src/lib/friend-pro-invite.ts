import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const FRIEND_PRO_PRICE_PAISE = 100;
export const FRIEND_PRO_PLAN = "500";
const INVITE_DURATION_MS = 3 * 24 * 60 * 60 * 1000;
const INVITE_TOKEN_PATTERN = /^[a-zA-Z0-9_-]{43}$/;
const ID_PATTERN = /^friend_[a-f0-9]{64}$/;

export type FriendInviteRecord = {
  id: string;
  email: string;
  plan: string;
  amount: number;
  status: string;
  expiresAt: Date | string;
  orderId?: string | null;
  redeemedBy?: string | null;
};

export function normalizedInviteEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? email
    : null;
}

export function generateFriendInviteToken() {
  return randomBytes(32).toString("base64url");
}

export function friendInviteId(token: unknown): string | null {
  if (typeof token !== "string" || !INVITE_TOKEN_PATTERN.test(token)) return null;
  return "friend_" + createHash("sha256")
    .update("earnwale:friend-pro-invite:v1:").update(token).digest("hex");
}

function expiresInFuture(value: Date | string) {
  return Number.isFinite(new Date(value).getTime()) &&
    new Date(value).getTime() > Date.now();
}

export function activeFriendInvite(record: FriendInviteRecord | null): boolean {
  return Boolean(
    record &&
    record.status === "pending" &&
    record.plan === FRIEND_PRO_PLAN &&
    Number(record.amount) === FRIEND_PRO_PRICE_PAISE &&
    expiresInFuture(record.expiresAt) &&
    !record.orderId
  );
}

export async function createFriendInvite(email: string) {
  const token = generateFriendInviteToken();
  const id = friendInviteId(token);
  if (!id) throw new Error("Unable to create invitation");
  const expiresAt = new Date(Date.now() + INVITE_DURATION_MS);
  await prisma.friendInvite.create({
    data: {
      id, email, plan: FRIEND_PRO_PLAN, amount: FRIEND_PRO_PRICE_PAISE,
      status: "pending", expiresAt, orderId: null, redeemedBy: null,
    },
  });
  return { id, token, expiresAt };
}

export async function findAvailableFriendInvite(token: unknown, recipientEmail?: unknown) {
  const id = friendInviteId(token);
  if (!id) return null;
  const invite = await prisma.friendInvite.findUnique({ where: { id } }) as FriendInviteRecord | null;
  if (!invite || invite.status !== "pending" ||
      invite.plan !== FRIEND_PRO_PLAN ||
      Number(invite.amount) !== FRIEND_PRO_PRICE_PAISE ||
      !expiresInFuture(invite.expiresAt)) return null;
  if (recipientEmail !== undefined) {
    const normalized = normalizedInviteEmail(recipientEmail);
    if (!normalized || normalized !== invite!.email) return null;
  }
  return invite!;
}

export async function reserveFriendInvite(inviteId: string, orderId: string, email: string) {
  if (!ID_PATTERN.test(inviteId) || !/^order_[a-zA-Z0-9]+$/.test(orderId)) {
    throw new Error("Invalid friend checkout");
  }
  await prisma.$transaction(async (tx: typeof prisma) => {
    const invite = await tx.friendInvite.findUnique({ where: { id: inviteId } }) as FriendInviteRecord | null;
    if (!activeFriendInvite(invite) || invite?.email !== email) {
      throw new Error("Friend invite already used or expired");
    }
    await tx.friendInvite.update({
      where: { id: inviteId }, data: { orderId, reservedAt: new Date() },
    });
  });
}

type RazorpayOrderRecord = {
  id: string;
  notes?: Record<string, unknown> | null;
  created_at?: number;
};

export async function friendInviteFromOrder(
  order: RazorpayOrderRecord, recipientEmail: string, plan: string
): Promise<FriendInviteRecord | null> {
  if (String(order.notes?.friendInvite ?? "") !== "true") return null;
  const id = String(order.notes?.friendInviteId ?? "");
  const email = normalizedInviteEmail(recipientEmail);
  if (!ID_PATTERN.test(id) || !email || plan !== FRIEND_PRO_PLAN ||
      String(order.notes?.plan ?? "") !== FRIEND_PRO_PLAN ||
      String(order.notes?.recipientEmail ?? "") !== email) {
    throw new Error("Friend checkout does not match the invited account");
  }
  const invite = await prisma.friendInvite.findUnique({ where: { id } }) as FriendInviteRecord | null;
  const expiredAt = invite ? new Date(invite.expiresAt).getTime() : 0;
  const orderedAt = Number(order.created_at ?? 0) * 1000;
  if (!invite || invite.status !== "pending" ||
      invite.email !== email || invite.orderId !== order.id ||
      invite.plan !== FRIEND_PRO_PLAN ||
      Number(invite.amount) !== FRIEND_PRO_PRICE_PAISE ||
      !orderedAt || orderedAt > expiredAt + 5000) {
    throw new Error("Friend invitation already used or does not match this order");
  }
  return invite;
}

export async function redeemFriendInviteInTransaction(
  tx: typeof prisma, invite: FriendInviteRecord, orderId: string, userId: string
) {
  const current = await tx.friendInvite.findUnique({ where: { id: invite.id } }) as FriendInviteRecord | null;
  if (!current || current.status !== "pending" || current.orderId !== orderId ||
      current.email !== invite.email || current.plan !== FRIEND_PRO_PLAN) {
    throw new Error("Friend invitation already redeemed");
  }
  await tx.friendInvite.update({
    where: { id: invite.id },
    data: { status: "redeemed", redeemedBy: userId, redeemedAt: new Date() },
  });
}
