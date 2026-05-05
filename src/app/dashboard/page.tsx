import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { DashboardCards } from "@/components/DashboardCards";
import { QuickActions } from "@/components/QuickActions";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "@/lib/dateUtils";
import { getTenantSession } from "@/lib/tenant";

async function getDashboardData(borrachariaId: string) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const base = { borrachariaId };

  const [
    todayServices,
    todayExpenses,
    monthServices,
    monthExpenses,
    pendingCount,
  ] = await Promise.all([
    prisma.service.aggregate({
      where: { ...base, occurredAt: { gte: todayStart, lte: todayEnd }, paymentStatus: { not: "COURTESY" } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.expense.aggregate({
      where: { ...base, occurredAt: { gte: todayStart, lte: todayEnd } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.service.aggregate({
      where: { ...base, occurredAt: { gte: monthStart, lte: monthEnd }, paymentStatus: { not: "COURTESY" } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.expense.aggregate({
      where: { ...base, occurredAt: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.service.count({
      where: { ...base, paymentStatus: { in: ["PENDING", "PARTIAL"] } },
    }),
  ]);

  return {
    today: {
      income: Number(todayServices._sum.amount ?? 0),
      expenses: Number(todayExpenses._sum.amount ?? 0),
      serviceCount: todayServices._count,
    },
    month: {
      income: Number(monthServices._sum.amount ?? 0),
      expenses: Number(monthExpenses._sum.amount ?? 0),
      serviceCount: monthServices._count,
    },
    pendingCount,
  };
}

export default async function DashboardPage() {
  const session = await getTenantSession();
  if (!session) redirect("/login");

  const data = await getDashboardData(session.user.borrachariaId!);
  const isAdmin = session.user.role === "ADMIN";

  return (
    <>
      <Header title="Dashboard" />
      <div className="px-4 py-4 space-y-4">
        <DashboardCards data={data} isAdmin={isAdmin} />
        <QuickActions isAdmin={isAdmin} pendingCount={data.pendingCount} />
      </div>
    </>
  );
}
