import { createBorracharia } from "@/app/actions/admin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewBorrachariaPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-1 text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nova Borracharia</h1>
      </div>

      <form action={createBorracharia} className="space-y-4 bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Dados da Borracharia</h2>

        <div>
          <label className="label">Nome *</label>
          <input name="name" required className="input" placeholder="Borracharia do João" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">CNPJ</label>
            <input name="cnpj" className="input" placeholder="00.000.000/0001-00" />
          </div>
          <div>
            <label className="label">CPF</label>
            <input name="cpf" className="input" placeholder="000.000.000-00" />
          </div>
        </div>

        <div>
          <label className="label">Endereço *</label>
          <input name="address" required className="input" placeholder="Rua, número, bairro" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Cidade *</label>
            <input name="city" required className="input" placeholder="São Paulo" />
          </div>
          <div>
            <label className="label">Estado *</label>
            <input name="state" required maxLength={2} className="input" placeholder="SP" />
          </div>
        </div>

        <div>
          <label className="label">CEP *</label>
          <input name="zipCode" required className="input" placeholder="00000-000" />
        </div>

        <hr className="border-gray-100" />
        <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Usuário Administrador</h2>

        <div>
          <label className="label">Nome do admin *</label>
          <input name="adminName" required className="input" placeholder="João Silva" />
        </div>
        <div>
          <label className="label">Email do admin *</label>
          <input name="adminEmail" type="email" required className="input" placeholder="admin@borracharia.com" />
        </div>
        <div>
          <label className="label">Senha inicial *</label>
          <input name="adminPassword" type="password" required minLength={6} className="input" placeholder="Mínimo 6 caracteres" />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl">
          Criar Borracharia
        </button>
      </form>
    </div>
  );
}
