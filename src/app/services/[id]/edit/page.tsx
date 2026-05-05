import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { ServiceForm } from "@/components/ServiceForm";
import { getTenantSession } from "@/lib/tenant";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getTenantSession();
  const { id } = await params;

  const [service, serviceTypes, convenios] = await Promise.all([
    prisma.service.findFirst({
      where: { id, borrachariaId: session.user.borrachariaId!, deletedAt: null },
    }),
    prisma.serviceType.findMany({
      where: { active: true, borrachariaId: session.user.borrachariaId! },
      orderBy: { name: "asc" },
    }),
    prisma.convenio.findMany({
      where: { active: true, borrachariaId: session.user.borrachariaId!, deletedAt: null },
      orderBy: { companyName: "asc" },
    }),
  ]);

  if (!service) notFound();

  return (
    <AppShell>
      <Header title="Editar Serviço" />
      <div className="px-4 py-4">
        <ServiceForm serviceTypes={serviceTypes} convenios={convenios} editingService={service} />
      </div>
    </AppShell>
  );
}
