import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { toggleUser, createUserForBorracharia, updateBorracharia } from "@/app/actions/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function BorrachariaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const borracharia = await prisma.borracharia.findUnique({
    where: { id },
    include: { users: { orderBy: { createdAt: "asc" } } },
  });

  if (!borracharia) notFound();

  const ROLE_LABELS: Record<string, string> = { ADMIN: "Admin", OPERATOR: "Operador" };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-1 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900 truncate">{borracharia.name}</h1>
      </div>

      {/* Editar dados */}
      <form action={updateBorracharia.bind(null, id)} className="space-y-3 bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Dados</h2>
        <div>
          <label className="label">Nome *</label>
          <input name="name" required defaultValue={borracharia.name} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">CNPJ</label>
            <input name="cnpj" defaultValue={borracharia.cnpj ?? ""} className="input" />
          </div>
          <div>
            <label className="label">CPF</label>
            <input name="cpf" defaultValue={borracharia.cpf ?? ""} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Endereço *</label>
          <input name="address" required defaultValue={borracharia.address} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Cidade *</label>
            <input name="city" required defaultValue={borracharia.city} className="input" />
          </div>
          <div>
            <label className="label">Estado *</label>
            <input name="state" required maxLength={2} defaultValue={borracharia.state} className="input" />
          </div>
        </div>
        <div>
          <label className="label">CEP *</label>
          <input name="zipCode" required defaultValue={borracharia.zipCode} className="input" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm">
          Salvar Alterações
        </button>
      </form>

      {/* Usuários */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Usuários</h2>

        {borracharia.users.map((u) => (
          <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-900">{u.name}</p>
              <p className="text-xs text-gray-500">{u.email} · {ROLE_LABELS[u.role]}</p>
            </div>
            <form action={toggleUser.bind(null, u.id, !u.active)}>
              <button
                type="submit"
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  u.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {u.active ? "Ativo" : "Inativo"}
              </button>
            </form>
          </div>
        ))}

        {/* Criar novo usuário */}
        <form action={createUserForBorracharia} className="space-y-3 pt-2">
          <input type="hidden" name="borrachariaId" value={id} />
          <p className="text-sm font-medium text-gray-700">Adicionar usuário</p>
          <div>
            <label className="label">Nome *</label>
            <input name="name" required className="input" placeholder="Nome completo" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input name="email" type="email" required className="input" placeholder="email@exemplo.com" />
          </div>
          <div>
            <label className="label">Senha *</label>
            <input name="password" type="password" required minLength={6} className="input" />
          </div>
          <div>
            <label className="label">Perfil *</label>
            <select name="role" required className="select">
              <option value="OPERATOR">Operador</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-gray-800 text-white font-semibold py-2.5 rounded-xl text-sm">
            Adicionar Usuário
          </button>
        </form>
      </div>
    </div>
  );
}
