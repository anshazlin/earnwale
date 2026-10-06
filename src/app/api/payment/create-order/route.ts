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

    if (!amount) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
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
