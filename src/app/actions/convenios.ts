"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/tenant";
import { PaymentFrequency } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

async function requireAdminTenant() {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return session;
}

export async function createConvenio(formData: FormData) {
  const session = await requireAdminTenant();
  const borrachariaId = session.user.borrachariaId!;

  const companyName = (formData.get("companyName") as string).trim();
  const paymentFrequency = formData.get("paymentFrequency") as PaymentFrequency;
  const nextPaymentDate = formData.get("nextPaymentDate") as string;
  const notes = (formData.get("notes") as string).trim() || null;

  await prisma.convenio.create({
    data: {
      borrachariaId,
      companyName,
      paymentFrequency,
      nextPaymentDate: new Date(nextPaymentDate),
      notes,
    },
  });

  revalidatePath("/convenios");
  redirect("/convenios");
}

export async function toggleConvenio(id: string, active: boolean) {
  const session = await requireAdminTenant();

  await prisma.convenio.updateMany({
    where: { id, borrachariaId: session.user.borrachariaId! },
    data: { active },
  });

  revalidatePath("/convenios");
}

/**
 * Liquidação FIFO:
 * - Busca serviços PENDING ou PARTIAL do convênio, mais antigos primeiro
 * - Aplica o valor pago seguindo FIFO
 * - Serviços totalmente cobertos → PAID
 * - Último serviço parcialmente coberto → PARTIAL
 * - Atualiza nextPaymentDate do convênio conforme frequência
 */
export async function settleConvenio(formData: FormData) {
  const session = await getTenantSession();
  const convenioId = formData.get("convenioId") as string;
  const amountPaidStr = formData.get("amountPaid") as string;
  const notes = (formData.get("notes") as string).trim() || null;
  const paidAt = (formData.get("paidAt") as string) || new Date().toISOString();

  const amountPaid = parseFloat(amountPaidStr);
  if (!amountPaid || amountPaid <= 0) throw new Error("Valor inválido.");

  // Valida que o convênio pertence à borracharia do usuário
  const convenio = await prisma.convenio.findFirst({
    where: { id: convenioId, borrachariaId: session.user.borrachariaId! },
  });
  if (!convenio) throw new Error("Convênio não encontrado.");

  // Busca serviços pendentes FIFO
  const pendingServices = await prisma.service.findMany({
    where: {
      convenioId,
      paymentStatus: { in: ["PENDING", "PARTIAL"] },
      deletedAt: null,
    },
    orderBy: { occurredAt: "asc" },
  });

  // Cria o registro de pagamento
  const payment = await prisma.convenioPayment.create({
    data: {
      convenioId,
      amountPaid: amountPaid,
      paidAt: new Date(paidAt),
      notes,
    },
  });

  // Aplica FIFO
  let remaining = amountPaid;

  for (const service of pendingServices) {
    if (remaining <= 0) break;

    const alreadyPaid = Number(service.amountPaid);
    const total = Number(service.amount);
    const outstanding = total - alreadyPaid;

    if (remaining >= outstanding) {
      // Pagamento total deste serviço
      await prisma.service.update({
        where: { id: service.id },
        data: {
          paymentStatus: "PAID",
          amountPaid: new Decimal(total),
          amountDue: new Decimal(0),
          convenioPaymentId: payment.id,
        },
      });
      remaining -= outstanding;
    } else {
      // Pagamento parcial deste serviço
      await prisma.service.update({
        where: { id: service.id },
        data: {
          paymentStatus: "PARTIAL",
          amountPaid: new Decimal(alreadyPaid + remaining),
          amountDue: new Decimal(outstanding - remaining),
          convenioPaymentId: payment.id,
        },
      });
      remaining = 0;
    }
  }

  // Avança nextPaymentDate conforme frequência
  const next = new Date(convenio.nextPaymentDate);
  if (convenio.paymentFrequency === "MONTHLY") {
    next.setMonth(next.getMonth() + 1);
  } else if (convenio.paymentFrequency === "BIWEEKLY") {
    next.setDate(next.getDate() + 14);
  } else {
    next.setDate(next.getDate() + 7);
  }

  await prisma.convenio.update({
    where: { id: convenioId },
    data: { nextPaymentDate: next },
  });

  revalidatePath(`/convenios/${convenioId}/pagamento`);
  revalidatePath("/convenios");
  revalidatePath("/dashboard");
  redirect("/convenios");
}
