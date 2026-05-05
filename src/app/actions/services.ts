"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PaymentMethod } from "@prisma/client";

export async function createService(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const serviceTypeId = formData.get("serviceTypeId") as string;
  const description = formData.get("description") as string;
  const amount = formData.get("amount") as string;
  const paymentMethod = formData.get("paymentMethod") as PaymentMethod;
  const paymentStatus = formData.get("paymentStatus") as string;
  const notes = formData.get("notes") as string;
  const occurredAt = formData.get("occurredAt") as string;

  if (!serviceTypeId || !amount || !paymentMethod || !paymentStatus || !occurredAt) {
    throw new Error("Campos obrigatórios não preenchidos.");
  }

  const amountNum = parseFloat(amount);
  const isPaid = paymentStatus === "PAID" || paymentStatus === "COURTESY";

  await prisma.service.create({
    data: {
      userId: session.user.id,
      borrachariaId: session.user.borrachariaId,
      serviceTypeId,
      description: description || null,
      amount: amountNum,
      amountPaid: isPaid ? amountNum : 0,
      amountDue: isPaid ? 0 : amountNum,
      paymentMethod,
      paymentStatus: paymentStatus as never,
      notes: notes || null,
      occurredAt: new Date(occurredAt),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/services");
  redirect("/dashboard");
}

export async function updateServiceStatus(id: string, paymentStatus: string) {
  const session = await getSession();
  if (!session) redirect("/login");

  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) return;

  await prisma.service.update({
    where: { id },
    data: {
      paymentStatus: paymentStatus as never,
      amountPaid: paymentStatus === "PAID" ? service.amount : service.amountPaid,
      amountDue: paymentStatus === "PAID" ? 0 : service.amountDue,
    },
  });

  revalidatePath("/services");
  revalidatePath("/dashboard");
}

export async function deleteService(id: string) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  await prisma.service.delete({ where: { id } });

  revalidatePath("/services");
  revalidatePath("/dashboard");
}
