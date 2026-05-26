import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { ExpenseList } from "@/components/ExpenseList";
import { DateFilter } from "@/components/DateFilter";
import { Suspense } from "react";
import { getTenantSession } from "@/lib/tenant";
import { parseDateFilter } from "@/lib/dateUtils";
import type { Prisma } from "@prisma/client";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string; q?: string }>;
}) {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const sp = await searchParams;
  const dateRange = parseDateFilter(sp);
  const search = sp.q?.trim();
  const amountSearch = search ? Number(search.replace(",", ".")) : Number.NaN;
  const searchFilter: Prisma.ExpenseWhereInput | undefined = search
    ? {
        OR: [
          { description: { contains: search, mode: "insensitive" } },
          { category: { name: { contains: search, mode: "insensitive" } } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          ...(Number.isFinite(amountSearch) ? [{ amount: amountSearch }] : []),
        ],
      }
    : undefined;

  const expenseRows = await prisma.expense.findMany({
    where: {
      borrachariaId: session.user.borrachariaId!,
      deletedAt: null,
      ...(dateRange ? { occurredAt: dateRange } : {}),
      ...(searchFilter ?? {}),
    },
    orderBy: { occurredAt: "desc" },
    take: 200,
    select: {
      id: true,
      description: true,
      amount: true,
      paymentMethod: true,
      hasReceipt: true,
      occurredAt: true,
      category: { select: { name: true } },
      user: { select: { name: true } },
    },
  });

  const expenses = expenseRows.map((expense) => ({
    ...expense,
    amount: Number(expense.amount),
    occurredAt: expense.occurredAt.toISOString(),
  }));

  return (
    <AppShell>
      <Header title="Despesas" />
      <div className="px-4 py-4 space-y-3">
        <Suspense><DateFilter searchPlaceholder="Buscar por descrição, categoria, valor..." /></Suspense>
        <ExpenseList expenses={expenses} />
      </div>
    </AppShell>
  );
}
