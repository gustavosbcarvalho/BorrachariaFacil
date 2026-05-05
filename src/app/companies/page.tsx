import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { getTenantSession } from "@/lib/tenant";
import { toggleCompany } from "@/app/actions/companies";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

export default async function CompaniesPage() {
  const session = await getTenantSession();
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const companies = await prisma.company.findMany({
    where: { borrachariaId: session.user.borrachariaId! },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { convenios: { where: { deletedAt: null } } },
      },
    },
  });

  return (
    <AppShell>
      <Header title="Empresas" />
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{companies.length} empresa(s)</p>
          <Link href="/companies/new"
            className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg">
            <Plus className="w-4 h-4" /> Nova
          </Link>
        </div>

        {companies.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="font-medium">Nenhuma empresa cadastrada</p>
            <p className="text-sm mt-1">Empresas são usadas para convênios de frota</p>
          </div>
        )}

        {companies.map((c) => (
          <div key={c.id} className="card space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">{c.name}</p>
                {c.cnpj && <p className="text-xs text-gray-500">CNPJ: {c.cnpj}</p>}
                {c.phone && <p className="text-xs text-gray-500">📞 {c.phone}</p>}
                {c.contactName && <p className="text-xs text-gray-500">Contato: {c.contactName}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{c._count.convenios} convênio(s)</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {c.active ? "Ativo" : "Inativo"}
              </span>
            </div>

            <div className="flex gap-2">
              <Link href={`/companies/${c.id}/edit`}
                className="flex-1 flex items-center justify-center gap-1.5 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg">
                <Pencil className="w-4 h-4" /> Editar
              </Link>
              <form action={toggleCompany.bind(null, c.id, !c.active)}>
                <button type="submit"
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${c.active ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
                  {c.active ? "Desativar" : "Ativar"}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
