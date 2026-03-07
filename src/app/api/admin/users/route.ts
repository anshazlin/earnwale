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
    const search = url.searchParams.get("search")?.trim() ?? "";

    const page = Math.max(1, Number(pageParam) || 1);
    const take = PAGE_SIZE;
    const skip = (page - 1) * take;

    const where =
      search.length > 0
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          plan: true,
          earnings: true,
          totalEarned: true,
          referralCount: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      pageSize: take,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 },
    );
  }
}

