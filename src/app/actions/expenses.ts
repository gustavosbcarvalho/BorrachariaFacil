"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/tenant";
import { setFlash } from "@/lib/flash";
import type { PaymentMethod } from "@prisma/client";

const PAYMENT_METHODS = ["CASH", "PIX", "CARD"] as const;

function parseMoney(value: string) {
  const amount = Number(value.replace(",", "."));
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function parseOccurredAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function validateCategory(categoryId: string, borrachariaId: string) {
  return prisma.expenseCategory.findFirst({
    where: { id: categoryId, borrachariaId, active: true },
    select: { id: true },
  });
}

export async function createExpense(formData: FormData) {
  const session = await getTenantSession();
  const borrachariaId = session.user.borrachariaId!;

  const categoryId    = formData.get("categoryId") as string;
  const description   = formData.get("description") as string;
  const amount        = formData.get("amount") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const hasReceipt    = formData.get("hasReceipt") === "true";
  const notes         = formData.get("notes") as string;
  const occurredAt    = formData.get("occurredAt") as string;

  if (!categoryId || !description || !amount || !paymentMethod || !occurredAt) {
    await setFlash("Preencha todos os campos obrigatórios.", "error");
    redirect("/expenses/new");
  }

  if (!PAYMENT_METHODS.includes(paymentMethod as (typeof PAYMENT_METHODS)[number])) {
    await setFlash("Forma de pagamento inválida.", "error");
    redirect("/expenses/new");
  }

  const category = await validateCategory(categoryId, borrachariaId);
  if (!category) {
    await setFlash("Categoria inválida para esta borracharia.", "error");
    redirect("/expenses/new");
  }

  const amountNum = parseMoney(amount);
  const occurredDate = parseOccurredAt(occurredAt);
  if (amountNum === null || !occurredDate) {
    await setFlash("Valor ou data inválidos.", "error");
    redirect("/expenses/new");
  }

  await prisma.expense.create({
    data: {
      userId:        session.user.id,
      borrachariaId,
      categoryId,
      description,
      amount:        amountNum,
      paymentMethod: paymentMethod as PaymentMethod,
      hasReceipt,
      notes:         notes || null,
      occurredAt:    occurredDate,
    },
  });

  await setFlash("Despesa registrada com sucesso!");
  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  redirect("/dashboard");
}

export async function updateExpense(id: string, formData: FormData) {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  const borrachariaId = session.user.borrachariaId!;

  const expense = await prisma.expense.findFirst({
    where: { id, borrachariaId, deletedAt: null },
  });
  if (!expense) { await setFlash("Despesa não encontrada.", "error"); redirect("/expenses"); }

  const categoryId = formData.get("categoryId") as string;
  const description = formData.get("description") as string;
  const amount = formData.get("amount") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const occurredAt = formData.get("occurredAt") as string;

  if (!categoryId || !description || !amount || !paymentMethod || !occurredAt) {
    await setFlash("Preencha todos os campos obrigatórios.", "error");
    redirect(`/expenses/${id}/edit`);
  }

  if (!PAYMENT_METHODS.includes(paymentMethod as (typeof PAYMENT_METHODS)[number])) {
    await setFlash("Forma de pagamento inválida.", "error");
    redirect(`/expenses/${id}/edit`);
  }

  const category = await validateCategory(categoryId, borrachariaId);
  if (!category) {
    await setFlash("Categoria inválida para esta borracharia.", "error");
    redirect(`/expenses/${id}/edit`);
  }

  const amountNum = parseMoney(amount);
  const occurredDate = parseOccurredAt(occurredAt);
  if (amountNum === null || !occurredDate) {
    await setFlash("Valor ou data inválidos.", "error");
    redirect(`/expenses/${id}/edit`);
  }

  await prisma.expense.updateMany({
    where: { id, borrachariaId },
    data: {
      updatedById:   session.user.id,
      categoryId,
      description,
      amount:        amountNum,
      paymentMethod: paymentMethod as PaymentMethod,
      hasReceipt:    formData.get("hasReceipt") === "true",
      notes:         (formData.get("notes") as string) || null,
      occurredAt:    occurredDate,
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
  await setFlash("Despesa excluída com sucesso.");
}
