"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ServiceStatus, PaymentMethod } from "@prisma/client";

export async function createService(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const serviceTypeId = formData.get("serviceTypeId") as string;
  const description = formData.get("description") as string;
  const amount = formData.get("amount") as string;
  const paymentMethod = formData.get("paymentMethod") as PaymentMethod;
  const status = formData.get("status") as ServiceStatus;
  const notes = formData.get("notes") as string;
  const occurredAt = formData.get("occurredAt") as string;

  if (!serviceTypeId || !amount || !paymentMethod || !status || !occurredAt) {
    throw new Error("Campos obrigatórios não preenchidos.");
  }

  await prisma.service.create({
    data: {
      userId: session.user.id,
      serviceTypeId,
      description: description || null,
      amount: parseFloat(amount),
      paymentMethod,
      status,
      notes: notes || null,
      occurredAt: new Date(occurredAt),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/services");
  redirect("/dashboard");
}

export async function updateServiceStatus(id: string, status: ServiceStatus) {
  const session = await getSession();
  if (!session) redirect("/login");

  await prisma.service.update({
    where: { id },
    data: { status },
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
