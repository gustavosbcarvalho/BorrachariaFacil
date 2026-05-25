import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { ExpenseForm } from "@/components/ExpenseForm";
import { getTenantSession } from "@/lib/tenant";

export default async function NewExpensePage() {
  const session = await getTenantSession();

  const categories = await prisma.expenseCategory.findMany({
    where: { active: true, borrachariaId: session.user.borrachariaId! },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <AppShell>
      <Header title="Nova Despesa" />
      <div className="px-4 py-4">
        <ExpenseForm categories={categories} />
      </div>
    </AppShell>
  );
}
