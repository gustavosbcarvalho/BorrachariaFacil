import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { ServiceList } from "@/components/ServiceList";
import { DateFilter } from "@/components/DateFilter";
import { Suspense } from "react";
import { getTenantSession } from "@/lib/tenant";
import { parseDateFilter } from "@/lib/dateUtils";
import type { Prisma } from "@prisma/client";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string; q?: string }>;
}) {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const sp = await searchParams;
  const dateRange = parseDateFilter(sp);
  const search = sp.q?.trim();
  const amountSearch = search ? Number(search.replace(",", ".")) : Number.NaN;
  const searchFilter: Prisma.ServiceWhereInput | undefined = search
    ? {
        OR: [
          { vehiclePlate: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { serviceType: { name: { contains: search, mode: "insensitive" } } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { convenio: { is: { companyName: { contains: search, mode: "insensitive" } } } },
          ...(Number.isFinite(amountSearch)
            ? [{ amount: amountSearch }, { amountDue: amountSearch }]
            : []),
        ],
      }
    : undefined;

  const serviceRows = await prisma.service.findMany({
    where: {
      borrachariaId: session.user.borrachariaId!,
      deletedAt: null,
      ...(dateRange ? { occurredAt: dateRange } : {}),
      ...(searchFilter ?? {}),
    },
    orderBy: { occurredAt: "desc" },
    take: 200,
    select: {
      id: true,
      description: true,
      vehiclePlate: true,
      amount: true,
      amountDue: true,
      paymentMethod: true,
      paymentStatus: true,
      occurredAt: true,
      serviceType: { select: { name: true } },
      user: { select: { name: true } },
    },
  });

  const services = serviceRows.map((service) => ({
    ...service,
    amount: Number(service.amount),
    amountDue: Number(service.amountDue),
    occurredAt: service.occurredAt.toISOString(),
  }));

  return (
    <AppShell>
      <Header title="Serviços" />
      <div className="px-4 py-4 space-y-3">
        <Suspense><DateFilter searchPlaceholder="Buscar por placa, tipo, descrição..." /></Suspense>
        <ServiceList services={services} />
      </div>
    </AppShell>
  );
}
