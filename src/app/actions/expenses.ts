"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PaymentMethod } from "@prisma/client";

export async function createExpense(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

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
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  await prisma.expense.delete({ where: { id } });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}
