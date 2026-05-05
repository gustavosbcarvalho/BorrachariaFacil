"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/tenant";
import { PaymentMethod } from "@prisma/client";

export async function createService(formData: FormData) {
  const session = await getTenantSession();

  const serviceTypeId = formData.get("serviceTypeId") as string;
  const description = formData.get("description") as string;
  const amount = formData.get("amount") as string;
  const paymentMethod = formData.get("paymentMethod") as PaymentMethod;
  const paymentStatus = formData.get("paymentStatus") as string;
  const convenioId = formData.get("convenioId") as string | null;
  const notes = formData.get("notes") as string;
  const occurredAt = formData.get("occurredAt") as string;

  if (!serviceTypeId || !amount || !paymentMethod || !paymentStatus || !occurredAt) {
    throw new Error("Campos obrigatórios não preenchidos.");
  }

  const amountNum = parseFloat(amount);
  const isConvenio = paymentMethod === "CONVENIO";
  const isPaid = paymentStatus === "PAID" || paymentStatus === "COURTESY";

  await prisma.service.create({
    data: {
      userId: session.user.id,
      borrachariaId: session.user.borrachariaId,
      serviceTypeId,
      description: description || null,
      amount: amountNum,
      amountPaid: isPaid && !isConvenio ? amountNum : 0,
      amountDue: isPaid && !isConvenio ? 0 : amountNum,
      paymentMethod,
      paymentStatus: (isConvenio ? "PENDING" : paymentStatus) as never,
      convenioId: convenioId || null,
      notes: notes || null,
      occurredAt: new Date(occurredAt),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/services");
  redirect("/dashboard");
}

export async function updateServiceStatus(id: string, paymentStatus: string) {
  const session = await getTenantSession();

  // Valida que o serviço pertence à borracharia do usuário
  const service = await prisma.service.findFirst({
    where: { id, borrachariaId: session.user.borrachariaId! },
  });
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
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/login");

  // Valida que o serviço pertence à borracharia do usuário
  const service = await prisma.service.findFirst({
    where: { id, borrachariaId: session.user.borrachariaId! },
  });
  if (!service) return;

  await prisma.service.delete({ where: { id } });

  revalidatePath("/services");
  revalidatePath("/dashboard");
}
