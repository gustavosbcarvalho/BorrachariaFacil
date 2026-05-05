import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { getTenantSession } from "@/lib/tenant";
import { createConvenio } from "@/app/actions/convenios";
import { todayISO } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewConvenioPage() {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <AppShell>
      <Header title="Novo Convênio" />
      <div className="px-4 py-4">
        <form action={createConvenio} className="space-y-4">
          <div>
            <label className="label">Empresa *</label>
            <input
              type="text" name="companyName" required
              className="input" placeholder="Nome da empresa / frota"
            />
          </div>

          <div>
            <label className="label">Periodicidade do Pagamento *</label>
            <select name="paymentFrequency" required className="select">
              <option value="">Selecione...</option>
              <option value="WEEKLY">Semanal</option>
              <option value="BIWEEKLY">Quinzenal</option>
              <option value="MONTHLY">Mensal</option>
            </select>
          </div>

          <div>
            <label className="label">Primeiro Pagamento *</label>
            <input
              type="date" name="nextPaymentDate" required
              defaultValue={todayISO()} className="input"
            />
          </div>

          <div>
            <label className="label">Observações (opcional)</label>
            <textarea name="notes" className="input resize-none" rows={2} placeholder="Contato, condições, etc." />
          </div>

          <button type="submit" className="btn-primary">
            Criar Convênio
          </button>
          <Link href="/convenios" className="btn-secondary block text-center">
            <span className="flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5" /> Cancelar
            </span>
          </Link>
        </form>
      </div>
    </AppShell>
  );
}
