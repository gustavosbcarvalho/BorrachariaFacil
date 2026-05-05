import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { ServiceList } from "@/components/ServiceList";
import { DateFilter } from "@/components/DateFilter";
import { Suspense } from "react";
import { getTenantSession } from "@/lib/tenant";
import { parseDateFilter } from "@/lib/dateUtils";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const sp = await searchParams;
  const dateRange = parseDateFilter(sp);

  const services = await prisma.service.findMany({
    where: {
      borrachariaId: session.user.borrachariaId!,
      deletedAt: null,
      ...(dateRange ? { occurredAt: dateRange } : {}),
    },
    orderBy: { occurredAt: "desc" },
    take: 200,
    include: { serviceType: true, user: { select: { name: true } } },
  });

  return (
    <AppShell>
      <Header title="Serviços" />
      <div className="px-4 py-4 space-y-3">
        <Suspense><DateFilter /></Suspense>
        <ServiceList services={services} />
      </div>
    </AppShell>
  );
}
