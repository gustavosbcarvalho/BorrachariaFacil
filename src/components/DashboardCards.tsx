import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from "lucide-react";

interface DashboardData {
  today: { income: number; expenses: number; serviceCount: number };
  month: { income: number; expenses: number; serviceCount: number };
  pendingCount: number;
}

interface Props {
  data: DashboardData;
  isAdmin: boolean;
}

function StatCard({
  label,
  value,
  sub,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className={`card flex items-start gap-3 border-l-4 ${color}`}>
      <Icon className="w-8 h-8 flex-shrink-0 mt-0.5 opacity-70" />
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function DashboardCards({ data, isAdmin }: Props) {
  const todayBalance = data.today.income - data.today.expenses;
  const monthBalance = data.month.income - data.month.expenses;

  return (
    <div className="space-y-3">
      {/* HOJE */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-1">
        Hoje
      </h2>

      <StatCard
        label="Entradas"
        value={formatCurrency(data.today.income)}
        sub={`${data.today.serviceCount} serviço(s)`}
        color="border-green-500 text-green-600"
        icon={TrendingUp}
      />
      <StatCard
        label="Gastos"
        value={formatCurrency(data.today.expenses)}
        color="border-red-400 text-red-500"
        icon={TrendingDown}
      />
      <StatCard
        label="Saldo do dia"
        value={formatCurrency(todayBalance)}
        color={todayBalance >= 0 ? "border-blue-500 text-blue-600" : "border-orange-400 text-orange-500"}
        icon={Wallet}
      />

      {data.pendingCount > 0 && (
        <div className="card border-l-4 border-yellow-400 flex items-center gap-3">
          <AlertCircle className="w-7 h-7 text-yellow-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-700">
              {data.pendingCount} serviço(s) pendente(s) de pagamento
            </p>
          </div>
        </div>
      )}

      {/* MÊS — visível apenas para admin */}
      {isAdmin && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-1 pt-2">
            Este mês
          </h2>
          <StatCard
            label="Entradas do mês"
            value={formatCurrency(data.month.income)}
            sub={`${data.month.serviceCount} serviço(s)`}
            color="border-green-500 text-green-600"
            icon={TrendingUp}
          />
          <StatCard
            label="Gastos do mês"
            value={formatCurrency(data.month.expenses)}
            color="border-red-400 text-red-500"
            icon={TrendingDown}
          />
          <StatCard
            label="Saldo do mês"
            value={formatCurrency(monthBalance)}
            color={monthBalance >= 0 ? "border-blue-500 text-blue-600" : "border-orange-400 text-orange-500"}
            icon={Wallet}
          />
        </>
      )}
    </div>
  );
}
