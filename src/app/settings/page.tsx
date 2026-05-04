import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { SettingsView } from "@/components/SettingsView";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [serviceTypes, categories] = await Promise.all([
    prisma.serviceType.findMany({ orderBy: { name: "asc" } }),
    prisma.expenseCategory.findMany({ orderBy: { name: "asc" } }),
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
