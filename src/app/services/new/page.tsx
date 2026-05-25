import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { ServiceForm } from "@/components/ServiceForm";
import { getTenantSession } from "@/lib/tenant";

export default async function NewServicePage() {
  const session = await getTenantSession();

  const [serviceTypes, convenios] = await Promise.all([
    prisma.serviceType.findMany({
      where: { active: true, borrachariaId: session.user.borrachariaId! },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.convenio.findMany({
      where: { active: true, borrachariaId: session.user.borrachariaId! },
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    }),
  ]);

  return (
    <AppShell>
      <Header title="Novo Serviço" />
      <div className="px-4 py-4">
        <ServiceForm serviceTypes={serviceTypes} convenios={convenios} />
      </div>
    </AppShell>
  );
}
