"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/tenant";
import { setFlash } from "@/lib/flash";

async function requireAdmin() {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return session;
}

export async function createCompany(formData: FormData) {
  const session = await requireAdmin();

  const name        = (formData.get("name") as string).trim();
  const cnpj        = (formData.get("cnpj") as string).trim() || null;
  const contactName = (formData.get("contactName") as string).trim() || null;
  const phone       = (formData.get("phone") as string).trim() || null;

  await prisma.company.create({
    data: {
      borrachariaId: session.user.borrachariaId!,
      name,
      cnpj,
      contactName,
      phone,
    },
  });

  await setFlash("Empresa cadastrada com sucesso!");
  revalidatePath("/companies");
  redirect("/companies");
}

export async function updateCompany(id: string, formData: FormData) {
  const session = await requireAdmin();
  const borrachariaId = session.user.borrachariaId!;

  const company = await prisma.company.findFirst({
    where: { id, borrachariaId },
  });
  if (!company) redirect("/companies");

  await prisma.company.updateMany({
    where: { id, borrachariaId },
    data: {
      name:        (formData.get("name") as string).trim(),
      cnpj:        (formData.get("cnpj") as string).trim() || null,
      contactName: (formData.get("contactName") as string).trim() || null,
      phone:       (formData.get("phone") as string).trim() || null,
    },
  });

  await setFlash("Empresa atualizada com sucesso!");
  revalidatePath("/companies");
  redirect("/companies");
}

export async function toggleCompany(id: string, active: boolean) {
  const session = await requireAdmin();

  await prisma.company.updateMany({
    where: { id, borrachariaId: session.user.borrachariaId! },
    data:  { active },
  });

  revalidatePath("/companies");
}
