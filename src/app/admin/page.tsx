import { prisma } from "@/lib/prisma";
import { toggleBorracharia } from "@/app/actions/admin";
import Link from "next/link";
import { Plus, Settings, Users } from "lucide-react";

async function getBorracharias() {
  return prisma.borracharia.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: true, services: true } } },
  });
}

const PLAN_COLORS: Record<string, string> = {
  TRIAL: "bg-yellow-100 text-yellow-800",
  ACTIVE: "bg-green-100 text-green-800",
  SUSPENDED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-600",
};

export default async function AdminPage() {
  const borracharias = await getBorracharias();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Borracharias</h1>
        <Link
          href="/admin/borracharias/new"
          className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" /> Nova
        </Link>
      </div>

      {borracharias.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>Nenhuma borracharia cadastrada.</p>
        </div>
      )}

      {borracharias.map((b) => (
        <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">{b.name}</p>
              <p className="text-sm text-gray-500">{b.city}, {b.state}</p>
              {b.cnpj && <p className="text-xs text-gray-400">CNPJ: {b.cnpj}</p>}
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${PLAN_COLORS[b.planStatus]}`}>
              {b.planStatus}
            </span>
          </div>

          <div className="flex gap-3 text-sm text-gray-500">
            <span><Users className="w-3.5 h-3.5 inline mr-1" />{b._count.users} usuário(s)</span>
            <span>{b._count.services} serviço(s)</span>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/admin/borracharias/${b.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg"
            >
              <Settings className="w-4 h-4" /> Gerenciar
            </Link>
            <form action={toggleBorracharia.bind(null, b.id, !b.active)}>
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  b.active
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {b.active ? "Desativar" : "Ativar"}
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
