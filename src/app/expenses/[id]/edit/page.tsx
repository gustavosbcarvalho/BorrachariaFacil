import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { ExpenseForm } from "@/components/ExpenseForm";
import { getTenantSession } from "@/lib/tenant";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getTenantSession();
  const { id } = await params;

  const [expense, categories] = await Promise.all([
    prisma.expense.findFirst({
      where: { id, borrachariaId: session.user.borrachariaId!, deletedAt: null },
    }),
    prisma.expenseCategory.findMany({
      where: { active: true, borrachariaId: session.user.borrachariaId! },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!expense) notFound();

  return (
    <AppShell>
      <Header title="Editar Despesa" />
      <div className="px-4 py-4">
        <ExpenseForm categories={categories} editingExpense={expense} />
      </div>
    </AppShell>
  );
}
