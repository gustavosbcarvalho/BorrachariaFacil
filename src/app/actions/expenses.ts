"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/tenant";
import { PaymentMethod } from "@prisma/client";

export async function createExpense(formData: FormData) {
  const session = await getTenantSession();

  const categoryId = formData.get("categoryId") as string;
  const description = formData.get("description") as string;
  const amount = formData.get("amount") as string;
  const paymentMethod = formData.get("paymentMethod") as PaymentMethod;
  const hasReceipt = formData.get("hasReceipt") === "true";
  const notes = formData.get("notes") as string;
  const occurredAt = formData.get("occurredAt") as string;

  if (!categoryId || !description || !amount || !paymentMethod || !occurredAt) {
    throw new Error("Campos obrigatórios não preenchidos.");
  }

  await prisma.expense.create({
    data: {
      userId: session.user.id,
      borrachariaId: session.user.borrachariaId,
      categoryId,
      description,
      amount: parseFloat(amount),
      paymentMethod,
      hasReceipt,
      notes: notes || null,
      occurredAt: new Date(occurredAt),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  redirect("/dashboard");
}

export async function deleteExpense(id: string) {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/login");

  // Garante que a despesa pertence à borracharia do usuário
  const expense = await prisma.expense.findFirst({
    where: { id, borrachariaId: session.user.borrachariaId! },
  });
  if (!expense) return;

  await prisma.expense.delete({ where: { id } });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}
