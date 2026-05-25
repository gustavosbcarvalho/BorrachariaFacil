import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { SettingsView } from "@/components/SettingsView";
import { getTenantSession } from "@/lib/tenant";

export default async function SettingsPage() {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const borrachariaId = session.user.borrachariaId!;

  const [serviceTypes, categories] = await Promise.all([
    prisma.serviceType.findMany({
      where: { borrachariaId },
      select: { id: true, name: true, active: true },
      orderBy: { name: "asc" },
    }),
    prisma.expenseCategory.findMany({
      where: { borrachariaId },
      select: { id: true, name: true, active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <AppShell>
      <Header title="Configurações" />
      <div className="px-4 py-4">
        <SettingsView serviceTypes={serviceTypes} categories={categories} />
      </div>
    </AppShell>
  );
}
