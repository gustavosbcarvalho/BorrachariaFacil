import Link from "next/link";
import { Wrench, Receipt, BarChart3, List, FileText, CreditCard } from "lucide-react";

interface Props {
  isAdmin: boolean;
  pendingCount: number;
  pendingConvenioCount?: number;
}

export function QuickActions({ isAdmin, pendingCount, pendingConvenioCount = 0 }: Props) {
  return (
    <div className="space-y-3 pt-2">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-1">
        Ações rápidas
      </h2>

      <Link href="/services/new" className="btn-primary block text-center">
        <span className="flex items-center justify-center gap-2">
          <Wrench className="w-6 h-6" />
          Novo Serviço
        </span>
      </Link>

      <Link href="/expenses/new" className="btn-secondary block text-center">
        <span className="flex items-center justify-center gap-2">
          <Receipt className="w-6 h-6" />
          Nova Despesa
        </span>
      </Link>

      {isAdmin && (
        <>
          <Link href="/reports" className="block">
            <div className="card flex items-center gap-3 active:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Relatórios</p>
                <p className="text-sm text-gray-500">Diário, semanal e mensal</p>
              </div>
            </div>
          </Link>

          <Link href="/services" className="block">
            <div className="card flex items-center gap-3 active:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <List className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Histórico de Serviços</p>
                {pendingCount > 0 && (
                  <p className="text-sm text-yellow-600 font-medium">
                    {pendingCount} pendente(s)
                  </p>
                )}
              </div>
            </div>
          </Link>

          <Link href="/expenses" className="block">
            <div className="card flex items-center gap-3 active:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Histórico de Despesas</p>
                <p className="text-sm text-gray-500">Ver todas as despesas</p>
              </div>
            </div>
          </Link>

          <Link href="/convenios" className="block">
            <div className="card flex items-center gap-3 active:bg-gray-50 transition-colors">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Convênios</p>
                {pendingConvenioCount > 0 ? (
                  <p className="text-sm text-yellow-600 font-medium">
                    {pendingConvenioCount} empresa(s) com saldo em aberto
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Empresas e pagamentos</p>
                )}
              </div>
            </div>
          </Link>
        </>
      )}
    </div>
  );
}
