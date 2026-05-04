import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { ExpenseForm } from "@/components/ExpenseForm";

export default async function NewExpensePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const categories = await prisma.expenseCategory.findMany({
    where: { active: true },
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
