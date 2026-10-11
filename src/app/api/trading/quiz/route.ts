import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { hasTradingAccess } from "@/lib/trading-course";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

type Question = { id: number; question: string; options: [string, string, string, string]; answer: number; explanation: string };
type AttemptRecord = { id: string; score: number; total: number; passed: boolean; createdAt: Date };
const QUESTIONS: Question[] = [
  {id:1,question:"Which market is where a company initially issues new securities?",options:["Primary market","Secondary market","Over-the-counter resale","Brokerage ledger"],answer:0,explanation:"Primary-market issuance makes newly issued securities available; secondary markets trade existing securities."},
  {id:2,question:"A company share generally represents what?",options:["A fixed-interest loan","An ownership interest","A guaranteed dividend","A risk-free claim"],answer:1,explanation:"Shares represent ownership interests; dividends and price returns are not guaranteed."},
  {id:3,question:"Which statement best describes a bond?",options:["Always a company ownership share","Generally a debt instrument","Carries no risk","Always a derivative"],answer:1,explanation:"Bonds generally represent debt and can carry credit and interest-rate risk."},
  {id:4,question:"What is a main function of a stock exchange?",options:["Guarantee profit","Set all future prices","Facilitate organised trading","Reverse losing trades"],answer:2,explanation:"Exchanges organise securities trading under market rules; they do not guarantee outcomes."},
  {id:5,question:"If the fictional bid is ₹99 and ask ₹101, what is the spread?",options:["₹1","₹2","₹99","₹200"],answer:1,explanation:"The bid-ask spread equals ₹101 minus ₹99 = ₹2."},
  {id:6,question:"Which order may remain unfilled if its price condition is not met?",options:["Limit order","Every market order","Completed settlement","Dividend payment"],answer:0,explanation:"A limit order constrains the price and may not execute."},
  {id:7,question:"What does OHLC stand for?",options:["Open, high, low, close","Open, hedge, loan, cost","Offer, hold, limit, cash","Order, high, leverage, close"],answer:0,explanation:"A candlestick summarises open, high, low and close during an interval."},
  {id:8,question:"For fictional O100 H108 L97 C105, what is the full range?",options:["₹5","₹8","₹11","₹13"],answer:2,explanation:"High minus low = ₹108 − ₹97 = ₹11."},
  {id:9,question:"For fictional O105 H107 L95 C98, what is the candle body size?",options:["₹2","₹7","₹10","₹12"],answer:1,explanation:"Absolute difference between close and open = |98 − 105| = ₹7."},
  {id:10,question:"A candle closes above its open. What does that describe?",options:["An upward candle","A guaranteed reversal","A dividend payment","A riskless trading signal"],answer:0,explanation:"It describes that interval's opening and closing prices, not what the market will do next."},
  {id:11,question:"What is missing if only a list of closing prices is available?",options:["Time ordering","Closing prices","Open, high and low values","Number of observations"],answer:2,explanation:"Closing prices do not reconstruct the open, high and low needed for full OHLC candles."},
  {id:12,question:"What is a resistance zone?",options:["A guaranteed ceiling","An approximate past selling-pressure area","A regulatory halt","A fixed exchange fee"],answer:1,explanation:"Resistance is an approximate region inferred from historical price activity, not a certainty."},
  {id:13,question:"Which situation best describes a false breakout?",options:["Price crosses a zone then returns","Bond repays at maturity","A trade settles","New shares are issued"],answer:0,explanation:"Crossing a marked zone does not ensure price will sustain the move."},
  {id:14,question:"Which statement is an observation instead of a prediction?",options:["The market must rise next week","The chart cannot break support","The previous close was ₹104","A long wick guarantees a rally"],answer:2,explanation:"A documented prior close is historical data; the other statements claim future outcomes."},
  {id:15,question:"In an arithmetic exercise, 1% of hypothetical capital ₹20,000 equals:",options:["₹20","₹100","₹200","₹2,000"],answer:2,explanation:"₹20,000 × 0.01 = ₹200; this is not a recommended risk amount."},
  {id:16,question:"A study budget of ₹200, entry ₹100 and planned exit ₹95 imply which theoretical quantity before costs?",options:["20 shares","40 shares","100 shares","200 shares"],answer:1,explanation:"₹5 price difference per share gives floor(₹200/₹5) = 40 shares, before costs and price gaps."},
  {id:17,question:"Capital ₹1,000, entry ₹600, study budget ₹50 and hypothetical exit ₹575: maximum affordable cash-share quantity?",options:["0 shares","1 share","2 shares","4 shares"],answer:1,explanation:"Risk-based quantity is two, costing ₹1,200; available capital only covers one share."},
  {id:18,question:"An account falls from ₹10,000 to ₹8,000. What percentage increase is needed to return to ₹10,000?",options:["20%","22%","25%","30%"],answer:2,explanation:"The required ₹2,000 increase is 25% of the remaining ₹8,000."},
  {id:19,question:"Increasing risk impulsively to recover recent losses is called:",options:["Diversification","Revenge trading","Settlement","Liquidity provision"],answer:1,explanation:"Revenge trading is reacting to losses with emotionally driven additional risk."},
  {id:20,question:"Which practice best supports reflection after a simulated trading decision?",options:["Only record wins","Copy an influencer","Journal evidence, alternatives and risks","Assume past gains guarantee future results"],answer:2,explanation:"A useful journal includes evidence, alternative explanations, uncertainty and reflection."}
];
// Firestore-backed score history; the answer key never leaves GET responses.
async function authorisedUser(req: Request) {
  const { user } = await requireAuth(req);
  return hasTradingAccess(user.plan) ? user : null;
}
export async function GET(req: Request) {
  try {
    const user = await authorisedUser(req);
    if (!user) return NextResponse.json({ error: "Access denied" }, { status: 403 });
    if (new URL(req.url).searchParams.get("history") === "1") {
      const attempts = await prisma.courseAttempt.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      });
      return NextResponse.json({
        attempts: attempts.map((attempt: AttemptRecord) => ({
          id: attempt.id,
          score: attempt.score,
          total: attempt.total,
          passed: attempt.passed,
          createdAt: attempt.createdAt,
        })),
      }, { headers: { "Cache-Control": "private, no-store" } });
    }
    return NextResponse.json({
      passingScore: 16,
      questionCount: QUESTIONS.length,
      questions: QUESTIONS.map(({ id, question, options }) => ({ id, question, options })),
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return authErrorResponse(error); }
}
export async function POST(req: Request) {
  try {
    const user = await authorisedUser(req);
    if (!user) return NextResponse.json({ error: "Access denied" }, { status: 403 });

    const raw = await req.text();
    if (raw.length > 10000) return NextResponse.json({ error: "Submission too large" }, { status: 413 });
    let payload: unknown;
    try { payload = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
    if (!payload || typeof payload !== "object" || !("answers" in payload) || !Array.isArray(payload.answers) || payload.answers.length !== QUESTIONS.length) {
      return NextResponse.json({ error: "Submit exactly 20 answers" }, { status: 400 });
    }
    const submitted = new Map<number, number>();
    for (const item of payload.answers) {
      if (!item || !Number.isInteger(item.id) || !Number.isInteger(item.choice) ||
          item.choice < 0 || item.choice > 3 || submitted.has(item.id)) {
        return NextResponse.json({ error: "Invalid answer submission" }, { status: 400 });
      }
      submitted.set(item.id, item.choice);
    }
    if (QUESTIONS.some(q => !submitted.has(q.id))) {
      return NextResponse.json({ error: "Incomplete attempt" }, { status: 400 });
    }
    const score = QUESTIONS.filter(q => submitted.get(q.id) === q.answer).length;
    const passed = score >= 16;
    const record = await prisma.courseAttempt.create({
      data: {
        userId: user.id,
        courseId: "trading-starter-v1",
        score,
        total: QUESTIONS.length,
        passed,
      },
    });
    return NextResponse.json({
      attemptId: record.id,
      score,
      total: QUESTIONS.length,
      passed,
      passingScore: 16,
      review: QUESTIONS.map(q => ({
        id: q.id,
        correctChoice: q.answer,
        chosenChoice: submitted.get(q.id),
        explanation: q.explanation,
      })),
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return authErrorResponse(error); }
}
