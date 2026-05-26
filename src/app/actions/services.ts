"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/tenant";
import { setFlash } from "@/lib/flash";
import type { PaymentMethod, PaymentStatus } from "@prisma/client";

const PAYMENT_METHODS = ["CASH", "PIX", "CARD", "CONVENIO"] as const;
const PAYMENT_STATUSES = ["PAID", "PENDING", "COURTESY"] as const;

function parseMoney(value: string) {
  const amount = Number(value.replace(",", "."));
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function parseOccurredAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function validateServiceType(serviceTypeId: string, borrachariaId: string) {
  return prisma.serviceType.findFirst({
    where: { id: serviceTypeId, borrachariaId, active: true },
    select: { id: true },
  });
}

async function validateConvenio(convenioId: string, borrachariaId: string) {
  return prisma.convenio.findFirst({
    where: { id: convenioId, borrachariaId, active: true, deletedAt: null },
    select: { id: true },
  });
}

export async function createService(formData: FormData) {
  const session = await getTenantSession();
  const borrachariaId = session.user.borrachariaId!;

  const serviceTypeId = formData.get("serviceTypeId") as string;
  const description   = formData.get("description") as string;
  const vehiclePlate  = (formData.get("vehiclePlate") as string)?.toUpperCase().trim() || null;
  const amount        = formData.get("amount") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const paymentStatus = formData.get("paymentStatus") as string;
  const convenioId    = formData.get("convenioId") as string | null;
  const notes         = formData.get("notes") as string;
  const occurredAt    = formData.get("occurredAt") as string;

  if (!serviceTypeId || !amount || !paymentMethod || !paymentStatus || !occurredAt) {
    await setFlash("Preencha todos os campos obrigatórios.", "error");
    redirect("/services/new");
  }

  if (!PAYMENT_METHODS.includes(paymentMethod as PaymentMethod)) {
    await setFlash("Forma de pagamento inválida.", "error");
    redirect("/services/new");
  }

  if (!PAYMENT_STATUSES.includes(paymentStatus as (typeof PAYMENT_STATUSES)[number])) {
    await setFlash("Status de pagamento inválido.", "error");
    redirect("/services/new");
  }

  const serviceType = await validateServiceType(serviceTypeId, borrachariaId);
  if (!serviceType) {
    await setFlash("Tipo de serviço inválido para esta borracharia.", "error");
    redirect("/services/new");
  }

  const amountNum = parseMoney(amount);
  const occurredDate = parseOccurredAt(occurredAt);
  if (amountNum === null || !occurredDate) {
    await setFlash("Valor ou data inválidos.", "error");
    redirect("/services/new");
  }

  const isConvenio = paymentMethod === "CONVENIO";
  let validConvenioId: string | null = null;
  if (isConvenio) {
    if (!convenioId) {
      await setFlash("Selecione a empresa do convênio.", "error");
      redirect("/services/new");
    }
    const convenio = await validateConvenio(convenioId, borrachariaId);
    if (!convenio) {
      await setFlash("Convênio inválido para esta borracharia.", "error");
      redirect("/services/new");
    }
    validConvenioId = convenio.id;
  }

  const isPaid = paymentStatus === "PAID" || paymentStatus === "COURTESY";

  await prisma.service.create({
    data: {
      userId:        session.user.id,
      borrachariaId,
      serviceTypeId,
      description:   description || null,
      vehiclePlate,
      amount:        amountNum,
      amountPaid:    isPaid && !isConvenio ? amountNum : 0,
      amountDue:     isPaid && !isConvenio ? 0 : amountNum,
      paymentMethod: paymentMethod as PaymentMethod,
      paymentStatus: (isConvenio ? "PENDING" : paymentStatus) as never,
      convenioId:    validConvenioId,
      notes:         notes || null,
      occurredAt:    occurredDate,
    },
  });

  await setFlash("Serviço registrado com sucesso!");
  revalidatePath("/dashboard");
  revalidatePath("/services");
  redirect("/dashboard");
}

export async function updateService(id: string, formData: FormData) {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  const borrachariaId = session.user.borrachariaId!;

  const service = await prisma.service.findFirst({
    where: { id, borrachariaId, deletedAt: null },
  });
  if (!service) { await setFlash("Serviço não encontrado.", "error"); redirect("/services"); }

  const serviceTypeId = formData.get("serviceTypeId") as string;
  const description   = formData.get("description") as string;
  const vehiclePlate  = (formData.get("vehiclePlate") as string)?.toUpperCase().trim() || null;
  const amount        = formData.get("amount") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const paymentStatus = formData.get("paymentStatus") as string;
  const convenioId    = formData.get("convenioId") as string | null;
  const notes         = formData.get("notes") as string;
  const occurredAt    = formData.get("occurredAt") as string;

  if (!PAYMENT_METHODS.includes(paymentMethod as PaymentMethod)) {
    await setFlash("Forma de pagamento inválida.", "error");
    redirect(`/services/${id}/edit`);
  }

  if (!PAYMENT_STATUSES.includes(paymentStatus as (typeof PAYMENT_STATUSES)[number])) {
    await setFlash("Status de pagamento inválido.", "error");
    redirect(`/services/${id}/edit`);
  }

  const serviceType = await validateServiceType(serviceTypeId, borrachariaId);
  if (!serviceType) {
    await setFlash("Tipo de serviço inválido para esta borracharia.", "error");
    redirect(`/services/${id}/edit`);
  }

  const amountNum = parseMoney(amount);
  const occurredDate = parseOccurredAt(occurredAt);
  if (amountNum === null || !occurredDate) {
    await setFlash("Valor ou data inválidos.", "error");
    redirect(`/services/${id}/edit`);
  }

  const isConvenio = paymentMethod === "CONVENIO";
  let validConvenioId: string | null = null;
  if (isConvenio) {
    if (!convenioId) {
      await setFlash("Selecione a empresa do convênio.", "error");
      redirect(`/services/${id}/edit`);
    }
    const convenio = await validateConvenio(convenioId, borrachariaId);
    if (!convenio) {
      await setFlash("Convênio inválido para esta borracharia.", "error");
      redirect(`/services/${id}/edit`);
    }
    validConvenioId = convenio.id;
  }

  const effectiveStatus = isConvenio ? "PENDING" : paymentStatus;
  const isPaid = effectiveStatus === "PAID" || effectiveStatus === "COURTESY";

  await prisma.service.updateMany({
    where: { id, borrachariaId },
    data: {
      updatedById:   session.user.id,
      serviceTypeId,
      description:   description || null,
      vehiclePlate,
      amount:        amountNum,
      amountPaid:    isPaid ? amountNum : 0,
      amountDue:     isPaid ? 0 : amountNum,
      paymentMethod: paymentMethod as PaymentMethod,
      paymentStatus: effectiveStatus as PaymentStatus,
      convenioId:    validConvenioId,
      notes:         notes || null,
      occurredAt:    occurredDate,
    },
  });

  await setFlash("Serviço atualizado com sucesso!");
  revalidatePath("/services");
  revalidatePath("/dashboard");
  redirect("/services");
}

export async function updateServiceStatus(id: string, paymentStatus: string) {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  if (!["PAID", "PENDING", "PARTIAL"].includes(paymentStatus)) return;

  const service = await prisma.service.findFirst({
    where: { id, borrachariaId: session.user.borrachariaId!, deletedAt: null },
  });
  if (!service) return;

  await prisma.service.updateMany({
    where: { id, borrachariaId: session.user.borrachariaId! },
    data: {
      updatedById:  session.user.id,
      paymentStatus: paymentStatus as never,
      amountPaid:   paymentStatus === "PAID" ? service.amount : service.amountPaid,
      amountDue:    paymentStatus === "PAID" ? 0 : service.amountDue,
    },
  });

  revalidatePath("/services");
  revalidatePath("/dashboard");
  await setFlash("Status do serviço atualizado.");
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
  await setFlash("Serviço excluído com sucesso.");
}
