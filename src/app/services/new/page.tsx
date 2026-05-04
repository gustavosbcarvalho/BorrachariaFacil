import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { ServiceForm } from "@/components/ServiceForm";

export default async function NewServicePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const serviceTypes = await prisma.serviceType.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <AppShell>
      <Header title="Novo Serviço" />
      <div className="px-4 py-4">
        <ServiceForm serviceTypes={serviceTypes} />
      </div>
    </AppShell>
  );
}
