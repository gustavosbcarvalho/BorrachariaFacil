"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/login");
  return session;
}

export async function createServiceType(formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return;
  await prisma.serviceType.upsert({
    where: { name },
    update: { active: true },
    create: { name },
  });
  revalidatePath("/settings");
}

export async function toggleServiceType(id: string, active: boolean) {
  await requireAdmin();
  await prisma.serviceType.update({ where: { id }, data: { active } });
  revalidatePath("/settings");
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return;
  await prisma.expenseCategory.upsert({
    where: { name },
    update: { active: true },
    create: { name },
  });
  revalidatePath("/settings");
}

export async function toggleCategory(id: string, active: boolean) {
  await requireAdmin();
  await prisma.expenseCategory.update({ where: { id }, data: { active } });
  revalidatePath("/settings");
}
