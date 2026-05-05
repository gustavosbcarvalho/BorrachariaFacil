"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/tenant";
import { setFlash } from "@/lib/flash";
import { PaymentMethod } from "@prisma/client";

export async function createExpense(formData: FormData) {
  const session = await getTenantSession();

  const categoryId    = formData.get("categoryId") as string;
  const description   = formData.get("description") as string;
  const amount        = formData.get("amount") as string;
  const paymentMethod = formData.get("paymentMethod") as PaymentMethod;
  const hasReceipt    = formData.get("hasReceipt") === "true";
  const notes         = formData.get("notes") as string;
  const occurredAt    = formData.get("occurredAt") as string;

  if (!categoryId || !description || !amount || !paymentMethod || !occurredAt) {
    await setFlash("Preencha todos os campos obrigatórios.", "error");
    redirect("/expenses/new");
  }

  await prisma.expense.create({
    data: {
      userId:        session.user.id,
      borrachariaId: session.user.borrachariaId,
      categoryId,
      description,
      amount:        parseFloat(amount),
      paymentMethod,
      hasReceipt,
      notes:         notes || null,
      occurredAt:    new Date(occurredAt),
    },
  });

  await setFlash("Despesa registrada com sucesso!");
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  redirect("/dashboard");
}

export async function updateExpense(id: string, formData: FormData) {
  const session = await getTenantSession();

  const expense = await prisma.expense.findFirst({
    where: { id, borrachariaId: session.user.borrachariaId!, deletedAt: null },
  });
  if (!expense) { await setFlash("Despesa não encontrada.", "error"); redirect("/expenses"); }

  await prisma.expense.update({
    where: { id },
    data: {
      updatedById:   session.user.id,
      categoryId:    formData.get("categoryId") as string,
      description:   formData.get("description") as string,
      amount:        parseFloat(formData.get("amount") as string),
      paymentMethod: formData.get("paymentMethod") as PaymentMethod,
      hasReceipt:    formData.get("hasReceipt") === "true",
      notes:         (formData.get("notes") as string) || null,
      occurredAt:    new Date(formData.get("occurredAt") as string),
    },
  });

  await setFlash("Despesa atualizada com sucesso!");
  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  redirect("/expenses");
}

export async function deleteExpense(id: string) {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/login");

  await prisma.expense.updateMany({
    where: { id, borrachariaId: session.user.borrachariaId! },
    data:  { deletedAt: new Date(), updatedById: session.user.id },
  });

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
}
