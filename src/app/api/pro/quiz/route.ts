import { createHmac, randomInt, randomUUID, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { hasProAccess } from "@/lib/pro-course";
import { PRO_QUESTIONS } from "@/lib/pro-questions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const QUIZ_SIZE = 8;
const PASSING_SCORE = 7;
const TICKET_LIFETIME_MS = 60 * 60 * 1000;
const LAST_SET_COOKIE = "earnwale_pro_quiz_last_v1";

const QUESTIONS = PRO_QUESTIONS;
type AttemptRecord = { id: string; score: number; total: number; passed: boolean; createdAt: Date };
type Ticket = {
  purpose: "exam" | "recent";
  userId: string;
  ids: number[];
  expiresAt: number;
  nonce: string;
};

// Signed selections stop clients from choosing their own easy questions, forging
// grades, or submitting questions from a different learner's assessment.
function signature(payload: string): Buffer {
  const secret = process.env.FIREBASE_PRIVATE_KEY;
  if (!secret) throw new Error("Quiz signing is not configured");
  return createHmac("sha256", secret).update("earnwale-pro-quiz-v1:").update(payload).digest();
}

function signTicket(ticket: Ticket): string {
  const body = Buffer.from(JSON.stringify(ticket)).toString("base64url");
  return `${body}.${signature(body).toString("base64url")}`;
}

function verifyTicket(value: unknown, userId: string, purpose: Ticket["purpose"]): Ticket | null {
  if (typeof value !== "string" || value.length > 1800) return null;
  const parts = value.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  try {
    const actual = Buffer.from(parts[1], "base64url");
    const expected = signature(parts[0]);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const parsed: unknown = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    if (!parsed || typeof parsed !== "object") return null;
    const ticket = parsed as Partial<Ticket>;
    if (ticket.purpose !== purpose || ticket.userId !== userId ||
        !Number.isSafeInteger(ticket.expiresAt) || (ticket.expiresAt ?? 0) < Date.now() ||
        typeof ticket.nonce !== "string" || ticket.nonce.length > 100 ||
        !Array.isArray(ticket.ids) || ticket.ids.length !== QUIZ_SIZE ||
        !ticket.ids.every(id => Number.isInteger(id) && QUESTIONS.some(q => q.id === id)) ||
        new Set(ticket.ids).size !== QUIZ_SIZE) return null;
    return ticket as Ticket;
  } catch { return null; }
}

function recentCookie(req: Request): string | null {
  const cookie = req.headers.get("cookie") ?? "";
  const entry = cookie.split(";").map(value => value.trim())
    .find(value => value.startsWith(LAST_SET_COOKIE + "="));
  if (!entry) return null;
  try { return decodeURIComponent(entry.slice(LAST_SET_COOKIE.length + 1)); }
  catch { return null; }
}

function shuffled<T>(values: T[]): T[] {
  const items = [...values];
  for (let index = items.length - 1; index > 0; index--) {
    const other = randomInt(index + 1);
    [items[index], items[other]] = [items[other], items[index]];
  }
  return items;
}

async function authorisedUser(req: Request) {
  const { user } = await requireAuth(req);
  return hasProAccess(user.plan) ? user : null;
}

export async function GET(req: Request) {
  try {
    const user = await authorisedUser(req);
    if (!user) return NextResponse.json({ error: "Access denied" }, { status: 403 });

    if (new URL(req.url).searchParams.get("history") === "1") {
      const attempts = await prisma.courseAttempt.findMany({
        where: { userId: user.id, courseId: "trading-pro-v1" },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      return NextResponse.json({
        attempts: attempts.map((attempt: AttemptRecord) => ({
          id: attempt.id, score: attempt.score, total: attempt.total,
          passed: attempt.passed, createdAt: attempt.createdAt,
        })),
      }, { headers: { "Cache-Control": "private, no-store" } });
    }

    // The Pro bank has 36 questions; exclude the previous 8 to avoid repeats
    // between consecutive refreshes in the same browser.
    const prior = verifyTicket(recentCookie(req), user.id, "recent");
    const previousIds = new Set(prior?.ids ?? []);
    const fresh = QUESTIONS.filter(question => !previousIds.has(question.id));
    const pool = fresh.length >= QUIZ_SIZE ? fresh : QUESTIONS;
    // Cover all six Pro lesson themes within each short assessment.
    const acrossModules = [1, 2, 3, 4, 5, 6].map(module =>
      shuffled(pool.filter(question => question.module === module))[0]
    ).filter(Boolean);
    const required = new Set(acrossModules.map(question => question.id));
    const extras = shuffled(pool.filter(question => !required.has(question.id))).slice(0, QUIZ_SIZE - acrossModules.length);
    const selection = shuffled([...acrossModules, ...extras]);
    const ids = selection.map(question => question.id);
    const token = signTicket({
      purpose: "exam", userId: user.id, ids,
      expiresAt: Date.now() + TICKET_LIFETIME_MS, nonce: randomUUID(),
    });
    const lastSet = signTicket({
      purpose: "recent", userId: user.id, ids,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, nonce: randomUUID(),
    });
    const response = NextResponse.json({
      token,
      passingScore: PASSING_SCORE,
      questionCount: QUIZ_SIZE,
      questions: selection.map(({ id, question, options }) => ({ id, question, options })),
    }, { headers: { "Cache-Control": "private, no-store" } });
    response.cookies.set(LAST_SET_COOKIE, lastSet, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", path: "/api/pro/quiz", maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch (error) { return authErrorResponse(error); }
}

export async function POST(req: Request) {
  try {
    const user = await authorisedUser(req);
    if (!user) return NextResponse.json({ error: "Access denied" }, { status: 403 });

    const raw = await req.text();
    if (raw.length > 10000) return NextResponse.json({ error: "Submission too large" }, { status: 413 });
    let payload: unknown;
    try { payload = JSON.parse(raw); }
    catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

    if (!payload || typeof payload !== "object" || !("token" in payload) ||
        !("answers" in payload) || !Array.isArray(payload.answers)) {
      return NextResponse.json({ error: "Invalid answer submission" }, { status: 400 });
    }
    const ticket = verifyTicket(payload.token, user.id, "exam");
    if (!ticket) return NextResponse.json({ error: "Quiz expired or invalid. Start a new set." }, { status: 400 });
    if (payload.answers.length !== QUIZ_SIZE) {
      return NextResponse.json({ error: "Submit exactly 8 answers" }, { status: 400 });
    }

    const submitted = new Map<number, number>();
    const selectedIds = new Set(ticket.ids);
    for (const item of payload.answers) {
      if (!item || typeof item !== "object" || !("id" in item) || !("choice" in item) ||
          typeof item.id !== "number" || typeof item.choice !== "number" ||
          !Number.isInteger(item.id) || !Number.isInteger(item.choice) ||
          item.choice < 0 || item.choice > 3 ||
          !selectedIds.has(item.id) || submitted.has(item.id)) {
        return NextResponse.json({ error: "Invalid answer submission" }, { status: 400 });
      }
      submitted.set(item.id, item.choice);
    }
    if (ticket.ids.some(id => !submitted.has(id))) {
      return NextResponse.json({ error: "Incomplete assessment" }, { status: 400 });
    }

    const existing = await prisma.courseAttempt.findUnique({ where: { id: ticket.nonce } });
    if (existing) return NextResponse.json({ error: "Already submitted. Start a new set." }, { status: 409 });

    const selected = ticket.ids.map(id => QUESTIONS.find(q => q.id === id)!);
    const score = selected.filter(question => submitted.get(question.id) === question.answer).length;
    const passed = score >= PASSING_SCORE;
    const record = await prisma.courseAttempt.create({
      data: {
        id: ticket.nonce,
        userId: user.id,
        courseId: "trading-pro-v1",
        questionIds: ticket.ids,
        score, total: QUIZ_SIZE, passed,
      },
    });
    return NextResponse.json({
      attemptId: record.id,
      score, total: QUIZ_SIZE, passed, passingScore: PASSING_SCORE,
      review: selected.map(question => ({
        id: question.id, chosenChoice: submitted.get(question.id),
        correctChoice: question.answer, explanation: question.explanation,
      })),
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return authErrorResponse(error); }
}
