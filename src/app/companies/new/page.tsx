import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { getTenantSession } from "@/lib/tenant";
import { createCompany } from "@/app/actions/companies";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewCompanyPage() {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <AppShell>
      <Header title="Nova Empresa" />
      <div className="px-4 py-4">
        <form action={createCompany} className="space-y-4">
          <div>
            <label className="label">Nome da Empresa *</label>
            <input name="name" required className="input" placeholder="Ex: Transportadora XYZ" />
          </div>
          <div>
            <label className="label">CNPJ</label>
            <input name="cnpj" className="input" placeholder="00.000.000/0001-00" />
          </div>
          <div>
            <label className="label">Nome do Contato</label>
            <input name="contactName" className="input" placeholder="João Silva" />
          </div>
          <div>
            <label className="label">Telefone</label>
            <input name="phone" type="tel" className="input" placeholder="(11) 99999-9999" inputMode="tel" />
          </div>
          <button type="submit" className="btn-primary">Cadastrar Empresa</button>
          <Link href="/companies" className="btn-secondary block text-center">
            <span className="flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5" /> Cancelar
            </span>
          </Link>
        </form>
      </div>
    </AppShell>
  );
}
