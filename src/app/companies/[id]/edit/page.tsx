import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { getTenantSession } from "@/lib/tenant";
import { updateCompany } from "@/app/actions/companies";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  const { id } = await params;

  const company = await prisma.company.findFirst({
    where: { id, borrachariaId: session.user.borrachariaId! },
  });
  if (!company) notFound();

  return (
    <AppShell>
      <Header title="Editar Empresa" />
      <div className="px-4 py-4">
        <form action={updateCompany.bind(null, id)} className="space-y-4">
          <div>
            <label className="label">Nome da Empresa *</label>
            <input name="name" required className="input" defaultValue={company.name} />
          </div>
          <div>
            <label className="label">CNPJ</label>
            <input name="cnpj" className="input" defaultValue={company.cnpj ?? ""} />
          </div>
          <div>
            <label className="label">Nome do Contato</label>
            <input name="contactName" className="input" defaultValue={company.contactName ?? ""} />
          </div>
          <div>
            <label className="label">Telefone</label>
            <input name="phone" type="tel" className="input" defaultValue={company.phone ?? ""} inputMode="tel" />
          </div>
          <button type="submit" className="btn-primary">Salvar Alterações</button>
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
