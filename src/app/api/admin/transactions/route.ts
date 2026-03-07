import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "auth_token";
const PAGE_SIZE = 10;

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie");
    if (!cookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE_NAME}=`))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const url = new URL(req.url);
    const pageParam = url.searchParams.get("page");
    const typeParam = url.searchParams.get("type");

    const page = Math.max(1, Number(pageParam) || 1);
    const take = PAGE_SIZE;
    const skip = (page - 1) * take;

    const normalizedType = (typeParam ?? "").toString().toUpperCase();
    const where =
      normalizedType === "CREDIT" || normalizedType === "DEBIT"
        ? { type: normalizedType }
        : {};

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          type: true,
          amount: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      transactions,
      total,
      page,
      pageSize: take,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

