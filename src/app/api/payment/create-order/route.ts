import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";

const PLAN_AMOUNTS: Record<string, number> = {
  "300": 30000,
  "500": 50000,
};

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();
    const amount = PLAN_AMOUNTS[plan];

    if (plan === "500") {
      return NextResponse.json({ error: "Pro enrollment is coming soon" }, { status: 409 });
    }

    if (!amount) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Fail closed until all student assets and compliance checks are complete.
    if (process.env.EARNWALE_STARTER_ENROLLMENT_ENABLED !== "true") {
      return NextResponse.json({ error: "Starter enrollment is not open yet" }, { status: 503 });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `earnwale_${Date.now()}`,
      notes: { plan },
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 }
    );
  }
}
