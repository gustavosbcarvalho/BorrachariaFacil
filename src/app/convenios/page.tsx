import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { getTenantSession } from "@/lib/tenant";
import { toggleConvenio } from "@/app/actions/convenios";
import { formatDate, formatCurrency, PAYMENT_FREQUENCY_LABELS } from "@/lib/utils";
import Link from "next/link";
import { Plus, CreditCard } from "lucide-react";

export default async function ConveniosPage() {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const convenios = await prisma.convenio.findMany({
    where: { borrachariaId: session.user.borrachariaId!, deletedAt: null },
    orderBy: { companyName: "asc" },
    include: {
      _count: {
        select: {
          services: {
            where: { paymentStatus: { in: ["PENDING", "PARTIAL"] }, deletedAt: null },
          },
        },
      },
      services: {
        where: { paymentStatus: { in: ["PENDING", "PARTIAL"] }, deletedAt: null },
        select: { amountDue: true },
      },
    },
  });

  return (
    <AppShell>
      <Header title="Convênios" />
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{convenios.length} convênio(s)</p>
          <Link
            href="/convenios/new"
            className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" /> Novo
          </Link>
        </div>

        {convenios.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum convênio cadastrado</p>
            <p className="text-sm mt-1">Crie um convênio para registrar serviços de frota</p>
          </div>
        )}

        {convenios.map((c) => {
          const totalDue = c.services.reduce(
            (acc, s) => acc + Number(s.amountDue), 0
          );
          return (
            <div key={c.id} className="card space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{c.companyName}</p>
                  <p className="text-sm text-gray-500">
                    {PAYMENT_FREQUENCY_LABELS[c.paymentFrequency]} · Próximo: {formatDate(c.nextPaymentDate)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {c.active ? "Ativo" : "Inativo"}
                </span>
              </div>

              {c._count.services > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="text-sm text-yellow-800">
                    {c._count.services} serviço(s) em aberto
                  </span>
                  <span className="font-bold text-yellow-900">{formatCurrency(totalDue)}</span>
                </div>
              )}

              <div className="flex gap-2">
                <Link
                  href={`/convenios/${c.id}/pagamento`}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg"
                >
                  <CreditCard className="w-4 h-4" /> Registrar Pagamento
                </Link>
                <form action={toggleConvenio.bind(null, c.id, !c.active)}>
                  <button
                    type="submit"
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                      c.active ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
                    }`}
                  >
                    {c.active ? "Desativar" : "Ativar"}
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
