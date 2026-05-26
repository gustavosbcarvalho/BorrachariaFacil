"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSystemAdmin } from "@/lib/auth";
import { Role, PlanStatus, PlanName } from "@prisma/client";
import bcrypt from "bcryptjs";

async function requireSystemAdminAction() {
  const session = await requireSystemAdmin();
  if (!session) redirect("/login");
  return session;
}

export async function createBorracharia(formData: FormData) {
  await requireSystemAdminAction();

  const name = (formData.get("name") as string).trim();
  const cnpj = (formData.get("cnpj") as string).trim() || null;
  const cpf = (formData.get("cpf") as string).trim() || null;
  const address = (formData.get("address") as string).trim();
  const city = (formData.get("city") as string).trim();
  const state = (formData.get("state") as string).trim();
  const zipCode = (formData.get("zipCode") as string).trim();

  // Usuário admin inicial
  const adminName = (formData.get("adminName") as string).trim();
  const adminEmail = (formData.get("adminEmail") as string).trim();
  const adminPassword = (formData.get("adminPassword") as string);

  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 30);

  const borracharia = await prisma.borracharia.create({
    data: {
      name, cnpj, cpf, address, city, state, zipCode,
      planStatus: PlanStatus.TRIAL,
      planName: PlanName.FREE,
      trialEndsAt,
    },
  });

  // Criar tipos de serviço padrão
  const defaultTypes = [
    "Troca de pneu", "Calibragem", "Remendo (câmara de ar)",
    "Remendo (pneu sem câmara)", "Balanceamento", "Alinhamento",
    "Troca de câmara de ar", "Vulcanização", "Conserto de roda", "Serviço avulso",
  ];
  await prisma.serviceType.createMany({
    data: defaultTypes.map((name) => ({ name, borrachariaId: borracharia.id })),
  });

  // Criar categorias de despesa padrão
  const defaultCategories = [
    "Materiais e peças", "Aluguel", "Água e energia", "Combustível",
    "Alimentação", "Equipamentos", "Manutenção", "Impostos e taxas",
    "Salários", "Outros",
  ];
  await prisma.expenseCategory.createMany({
    data: defaultCategories.map((name) => ({ name, borrachariaId: borracharia.id })),
  });

  // Criar usuário admin
  if (adminName && adminEmail && adminPassword) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash: hash,
        role: Role.ADMIN,
        borrachariaId: borracharia.id,
      },
    });
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function toggleBorracharia(id: string, active: boolean) {
  await requireSystemAdminAction();
  await prisma.borracharia.update({ where: { id }, data: { active } });
  revalidatePath("/admin");
}

export async function updateBorracharia(id: string, formData: FormData) {
  await requireSystemAdminAction();

  await prisma.borracharia.update({
    where: { id },
    data: {
      name: (formData.get("name") as string).trim(),
      cnpj: (formData.get("cnpj") as string).trim() || null,
      cpf: (formData.get("cpf") as string).trim() || null,
      address: (formData.get("address") as string).trim(),
      city: (formData.get("city") as string).trim(),
      state: (formData.get("state") as string).trim(),
      zipCode: (formData.get("zipCode") as string).trim(),
    },
  });

  revalidatePath("/admin");
  redirect("/admin");
}

export async function createUserForBorracharia(formData: FormData) {
  await requireSystemAdminAction();

  const borrachariaId = formData.get("borrachariaId") as string;
  const name = (formData.get("name") as string).trim();
  const email = (formData.get("email") as string).trim();
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;
  if (role !== Role.ADMIN && role !== Role.OPERATOR) redirect("/admin");

  const borracharia = await prisma.borracharia.findUnique({
    where: { id: borrachariaId },
    select: { id: true },
  });
  if (!borracharia) redirect("/admin");

  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash: hash, role, borrachariaId },
  });

  revalidatePath(`/admin/borracharias/${borrachariaId}`);
  redirect(`/admin/borracharias/${borrachariaId}`);
}

export async function toggleUser(id: string, active: boolean) {
  await requireSystemAdminAction();
  await prisma.user.updateMany({
    where: { id, borrachariaId: { not: null } },
    data: { active },
  });
  revalidatePath("/admin");
}
