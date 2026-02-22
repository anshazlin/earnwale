import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plan } = body;
    console.log("Plan received:", plan);

    if (!plan || (plan !== "300" && plan !== "500")) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const amount = plan === "300" ? 30000 : 50000; // in paise

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 }
    );
  }
}