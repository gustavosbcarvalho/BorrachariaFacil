import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { ReportView } from "@/components/ReportView";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "@/lib/dateUtils";
import { getTenantSession } from "@/lib/tenant";

async function getReportData(borrachariaId: string) {
  const now = new Date();
  const ranges = {
    day:   { gte: startOfDay(now),   lte: endOfDay(now)   },
    week:  { gte: startOfWeek(now),  lte: endOfWeek(now)  },
    month: { gte: startOfMonth(now), lte: endOfMonth(now) },
  };

  const svc = (range: { gte: Date; lte: Date }) =>
    prisma.service.findMany({
      where: { borrachariaId, occurredAt: range },
      include: { serviceType: true },
    });

  const exp = (range: { gte: Date; lte: Date }) =>
    prisma.expense.findMany({
      where: { borrachariaId, occurredAt: range },
      include: { category: true },
    });

  const [ds, ws, ms, de, we, me] = await Promise.all([
    svc(ranges.day), svc(ranges.week), svc(ranges.month),
    exp(ranges.day), exp(ranges.week), exp(ranges.month),
  ]);

  return {
    dayServices: ds, weekServices: ws, monthServices: ms,
    dayExpenses: de, weekExpenses: we, monthExpenses: me,
  };
}

export default async function ReportsPage() {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const data = await getReportData(session.user.borrachariaId!);

  return (
    <AppShell>
      <Header title="Relatórios" />
      <div className="px-4 py-4">
        <ReportView data={data} />
      </div>
    </AppShell>
  );
}
