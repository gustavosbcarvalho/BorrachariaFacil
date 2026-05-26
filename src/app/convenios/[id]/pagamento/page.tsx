import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { getTenantSession } from "@/lib/tenant";
import { settleConvenio } from "@/app/actions/convenios";
import { formatCurrency, formatDate, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ConvenioPagamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  const { id } = await params;

  const convenio = await prisma.convenio.findFirst({
    where: { id, borrachariaId: session.user.borrachariaId! },
  });
  if (!convenio) notFound();

  const pendingServices = await prisma.service.findMany({
    where: {
      borrachariaId: session.user.borrachariaId!,
      convenioId: id,
      paymentStatus: { in: ["PENDING", "PARTIAL"] },
      deletedAt: null,
    },
    orderBy: { occurredAt: "asc" },
    include: { serviceType: true },
  });

  const totalDue = pendingServices.reduce(
    (acc, s) => acc + Number(s.amountDue), 0
  );

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <AppShell>
      <Header title="Liquidar Convênio" />
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/convenios" className="text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="font-semibold text-gray-900">{convenio.companyName}</p>
            <p className="text-sm text-gray-500">
              Vencimento: {formatDate(convenio.nextPaymentDate)}
            </p>
          </div>
        </div>

        {/* Serviços em aberto */}
        <div className="card space-y-2">
          <p className="text-sm font-semibold text-gray-700">Serviços em aberto</p>

          {pendingServices.length === 0 ? (
            <p className="text-sm text-gray-400 py-2 text-center">Nenhum serviço pendente.</p>
          ) : (
            <div className="space-y-2">
              {pendingServices.map((s) => (
                <div key={s.id} className="flex items-start justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.serviceType.name}</p>
                    <p className="text-xs text-gray-500">{formatDate(s.occurredAt)}</p>
                    {Number(s.amountPaid) > 0 && (
                      <p className="text-xs text-orange-600">
                        Pago parcial: {formatCurrency(Number(s.amountPaid))}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-red-600">{formatCurrency(Number(s.amountDue))}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${PAYMENT_STATUS_COLORS[s.paymentStatus]}`}>
                      {PAYMENT_STATUS_LABELS[s.paymentStatus]}
                    </span>
                  </div>
                </div>
              ))}

              <div className="flex justify-between font-bold pt-2">
                <span>Total em aberto</span>
                <span className="text-red-600">{formatCurrency(totalDue)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Formulário de pagamento */}
        {pendingServices.length > 0 && (
          <form action={settleConvenio} className="card space-y-4">
            <input type="hidden" name="convenioId" value={id} />

            <p className="text-sm font-semibold text-gray-700">Registrar Pagamento</p>

            <div>
              <label className="label">Data do Pagamento *</label>
              <input
                type="date" name="paidAt" required
                defaultValue={todayStr} className="input"
              />
            </div>

            <div>
              <label className="label">Valor Pago pela Empresa (R$) *</label>
              <input
                type="number" name="amountPaid" required
                min="0.01" step="0.01" inputMode="decimal"
                defaultValue={totalDue.toFixed(2)}
                className="input text-xl font-bold"
                placeholder="0,00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Os serviços mais antigos serão liquidados primeiro (FIFO).
              </p>
            </div>

            <div>
              <label className="label">Observações (opcional)</label>
              <input type="text" name="notes" className="input" placeholder="Comprovante, nota, etc." />
            </div>

            <button type="submit" className="btn-primary">
              Registrar Pagamento
            </button>
          </form>
        )}
      </div>
    </AppShell>
  );
}
