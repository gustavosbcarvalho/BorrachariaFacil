"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantSession } from "@/lib/tenant";
import { requireSystemAdmin } from "@/lib/auth";
import { getSession } from "@/lib/auth";
import { setFlash } from "@/lib/flash";
import bcrypt from "bcryptjs";

export async function changePassword(formData: FormData) {
  // Funciona para qualquer usuário logado (incluindo SYSTEM_ADMIN)
  const session = await getSession();
  if (!session) redirect("/login");

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword     = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (newPassword !== confirmPassword) {
    await setFlash("Nova senha e confirmação não conferem.", "error");
    redirect("/profile");
  }

  if (newPassword.length < 6) {
    await setFlash("A senha deve ter pelo menos 6 caracteres.", "error");
    redirect("/profile");
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const currentOk = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!currentOk) {
    await setFlash("Senha atual incorreta.", "error");
    redirect("/profile");
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hash, mustChangePassword: false },
  });

  await setFlash("Senha alterada com sucesso!");

  if (session.user.role === "SYSTEM_ADMIN") redirect("/admin");
  redirect("/dashboard");
}
