import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Endpoint público — sem auth — apenas lista borracharias ativas
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  const borracharias = await prisma.borracharia.findMany({
    where: {
      active: true,
      ...(q.length > 0 && {
        name: { contains: q, mode: "insensitive" },
      }),
    },
    select: { id: true, name: true, city: true, state: true },
    orderBy: { name: "asc" },
    take: 20,
  });

  return NextResponse.json(borracharias);
}
