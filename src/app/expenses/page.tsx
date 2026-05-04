import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { ExpenseList } from "@/components/ExpenseList";

export default async function ExpensesPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const expenses = await prisma.expense.findMany({
    orderBy: { occurredAt: "desc" },
    take: 100,
    include: { category: true, user: { select: { name: true } } },
  });

  return (
    <AppShell>
      <Header title="Despesas" />
      <div className="px-4 py-4">
        <ExpenseList expenses={expenses} />
      </div>
    </AppShell>
  );
}
