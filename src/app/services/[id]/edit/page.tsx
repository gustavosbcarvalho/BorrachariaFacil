import { notFound } from "next/navigation";
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
      select: {
        id: true,
        serviceTypeId: true,
        description: true,
        vehiclePlate: true,
        amount: true,
        paymentMethod: true,
        paymentStatus: true,
        convenioId: true,
        notes: true,
        occurredAt: true,
      },
    }),
    prisma.serviceType.findMany({
      where: { active: true, borrachariaId: session.user.borrachariaId! },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.convenio.findMany({
      where: { active: true, borrachariaId: session.user.borrachariaId!, deletedAt: null },
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    }),
  ]);

  if (!service) notFound();

  const editingService = {
    ...service,
    amount: Number(service.amount),
    occurredAt: service.occurredAt.toISOString(),
  };

  return (
    <AppShell>
      <Header title="Editar Serviço" />
      <div className="px-4 py-4">
        <ServiceForm serviceTypes={serviceTypes} convenios={convenios} editingService={editingService} />
      </div>
    </AppShell>
  );
}
