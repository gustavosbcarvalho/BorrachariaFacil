import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { ServiceList } from "@/components/ServiceList";
import { getTenantSession } from "@/lib/tenant";

export default async function ServicesPage() {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const services = await prisma.service.findMany({
    where: { borrachariaId: session.user.borrachariaId! },
    orderBy: { occurredAt: "desc" },
    take: 100,
    include: {
      serviceType: true,
      user: { select: { name: true } },
    },
  });

  return (
    <AppShell>
      <Header title="Serviços" />
      <div className="px-4 py-4">
        <ServiceList services={services} />
      </div>
    </AppShell>
  );
}
