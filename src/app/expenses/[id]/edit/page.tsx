import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { ExpenseForm } from "@/components/ExpenseForm";
import { getTenantSession } from "@/lib/tenant";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  const { id } = await params;

  const [expense, categories] = await Promise.all([
    prisma.expense.findFirst({
      where: { id, borrachariaId: session.user.borrachariaId!, deletedAt: null },
      select: {
        id: true,
        categoryId: true,
        description: true,
        amount: true,
        paymentMethod: true,
        hasReceipt: true,
        notes: true,
        occurredAt: true,
      },
    }),
    prisma.expenseCategory.findMany({
      where: { active: true, borrachariaId: session.user.borrachariaId! },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!expense) notFound();

  const editingExpense = {
    ...expense,
    amount: Number(expense.amount),
    occurredAt: expense.occurredAt.toISOString(),
  };

  return (
    <AppShell>
      <Header title="Editar Despesa" />
      <div className="px-4 py-4">
        <ExpenseForm categories={categories} editingExpense={editingExpense} />
      </div>
    </AppShell>
  );
}
