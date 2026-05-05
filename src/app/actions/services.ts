"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/tenant";
import { setFlash } from "@/lib/flash";
import { PaymentMethod } from "@prisma/client";

export async function createService(formData: FormData) {
  const session = await getTenantSession();

  const serviceTypeId = formData.get("serviceTypeId") as string;
  const description   = formData.get("description") as string;
  const vehiclePlate  = (formData.get("vehiclePlate") as string)?.toUpperCase().trim() || null;
  const amount        = formData.get("amount") as string;
  const paymentMethod = formData.get("paymentMethod") as PaymentMethod;
  const paymentStatus = formData.get("paymentStatus") as string;
  const convenioId    = formData.get("convenioId") as string | null;
  const notes         = formData.get("notes") as string;
  const occurredAt    = formData.get("occurredAt") as string;

  if (!serviceTypeId || !amount || !paymentMethod || !paymentStatus || !occurredAt) {
    await setFlash("Preencha todos os campos obrigatórios.", "error");
    redirect("/services/new");
  }

  const amountNum = parseFloat(amount);
  const isConvenio = paymentMethod === "CONVENIO";
  const isPaid = paymentStatus === "PAID" || paymentStatus === "COURTESY";

  await prisma.service.create({
    data: {
      userId:        session.user.id,
      borrachariaId: session.user.borrachariaId,
      serviceTypeId,
      description:   description || null,
      vehiclePlate,
      amount:        amountNum,
      amountPaid:    isPaid && !isConvenio ? amountNum : 0,
      amountDue:     isPaid && !isConvenio ? 0 : amountNum,
      paymentMethod,
      paymentStatus: (isConvenio ? "PENDING" : paymentStatus) as never,
      convenioId:    convenioId || null,
      notes:         notes || null,
      occurredAt:    new Date(occurredAt),
    },
  });

  await setFlash("Serviço registrado com sucesso!");
  revalidatePath("/dashboard");
  revalidatePath("/services");
  redirect("/dashboard");
}

export async function updateService(id: string, formData: FormData) {
  const session = await getTenantSession();

  const service = await prisma.service.findFirst({
    where: { id, borrachariaId: session.user.borrachariaId!, deletedAt: null },
  });
  if (!service) { await setFlash("Serviço não encontrado.", "error"); redirect("/services"); }

  const serviceTypeId = formData.get("serviceTypeId") as string;
  const description   = formData.get("description") as string;
  const vehiclePlate  = (formData.get("vehiclePlate") as string)?.toUpperCase().trim() || null;
  const amount        = formData.get("amount") as string;
  const paymentMethod = formData.get("paymentMethod") as PaymentMethod;
  const paymentStatus = formData.get("paymentStatus") as string;
  const notes         = formData.get("notes") as string;
  const occurredAt    = formData.get("occurredAt") as string;

  const amountNum = parseFloat(amount);
  const isPaid    = paymentStatus === "PAID" || paymentStatus === "COURTESY";

  await prisma.service.update({
    where: { id },
    data: {
      updatedById:   session.user.id,
      serviceTypeId,
      description:   description || null,
      vehiclePlate,
      amount:        amountNum,
      amountPaid:    isPaid ? amountNum : 0,
      amountDue:     isPaid ? 0 : amountNum,
      paymentMethod,
      paymentStatus: paymentStatus as never,
      notes:         notes || null,
      occurredAt:    new Date(occurredAt),
    },
  });

  await setFlash("Serviço atualizado com sucesso!");
  revalidatePath("/services");
  revalidatePath("/dashboard");
  redirect("/services");
}

export async function updateServiceStatus(id: string, paymentStatus: string) {
  const session = await getTenantSession();

  const service = await prisma.service.findFirst({
    where: { id, borrachariaId: session.user.borrachariaId!, deletedAt: null },
  });
  if (!service) return;

  await prisma.service.update({
    where: { id },
    data: {
      updatedById:  session.user.id,
      paymentStatus: paymentStatus as never,
      amountPaid:   paymentStatus === "PAID" ? service.amount : service.amountPaid,
      amountDue:    paymentStatus === "PAID" ? 0 : service.amountDue,
    },
  });

  revalidatePath("/services");
  revalidatePath("/dashboard");
}

export async function deleteService(id: string) {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/login");

  await prisma.service.updateMany({
    where: { id, borrachariaId: session.user.borrachariaId! },
    data:  { deletedAt: new Date(), updatedById: session.user.id },
  });

  revalidatePath("/services");
  revalidatePath("/dashboard");
}
