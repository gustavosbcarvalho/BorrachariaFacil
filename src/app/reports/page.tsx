import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { ReportView } from "@/components/ReportView";
import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
} from "@/lib/dateUtils";

async function getReportData() {
  const now = new Date();
  const ranges = {
    day: { gte: startOfDay(now), lte: endOfDay(now) },
    week: { gte: startOfWeek(now), lte: endOfWeek(now) },
    month: { gte: startOfMonth(now), lte: endOfMonth(now) },
  };

  const buildServiceQuery = (range: { gte: Date; lte: Date }) =>
    prisma.service.findMany({
      where: { occurredAt: range },
      include: { serviceType: true },
    });

  const buildExpenseQuery = (range: { gte: Date; lte: Date }) =>
    prisma.expense.findMany({
      where: { occurredAt: range },
      include: { category: true },
    });

  const [
    dayServices, weekServices, monthServices,
    dayExpenses, weekExpenses, monthExpenses,
  ] = await Promise.all([
    buildServiceQuery(ranges.day),
    buildServiceQuery(ranges.week),
    buildServiceQuery(ranges.month),
    buildExpenseQuery(ranges.day),
    buildExpenseQuery(ranges.week),
    buildExpenseQuery(ranges.month),
  ]);

  return { dayServices, weekServices, monthServices, dayExpenses, weekExpenses, monthExpenses };
}

export default async function ReportsPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const data = await getReportData();

  return (
    <AppShell>
      <Header title="Relatórios" />
      <div className="px-4 py-4">
        <ReportView data={data} />
      </div>
    </AppShell>
  );
}
