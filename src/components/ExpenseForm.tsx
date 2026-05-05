"use client";

import { useFormStatus } from "react-dom";
import { createExpense, updateExpense } from "@/app/actions/expenses";
import { todayISO } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ExpenseCategory } from "@prisma/client";
import { useState } from "react";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary mt-2">
      {pending ? <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</> : label}
    </button>
  );
}

interface EditingExpense {
  id: string;
  categoryId: string;
  description: string;
  amount: unknown;
  paymentMethod: string;
  hasReceipt: boolean;
  notes: string | null;
  occurredAt: Date;
}

interface Props {
  categories: ExpenseCategory[];
  editingExpense?: EditingExpense;
}

export function ExpenseForm({ categories, editingExpense }: Props) {
  const isEdit = !!editingExpense;
  const [hasReceipt, setHasReceipt] = useState(editingExpense?.hasReceipt ?? false);
  const [selectedPayment, setSelectedPayment] = useState(editingExpense?.paymentMethod ?? "CASH");

  const action = isEdit
    ? updateExpense.bind(null, editingExpense!.id)
    : createExpense;

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label">Data *</label>
        <input type="date" name="occurredAt" required
          defaultValue={editingExpense
            ? new Date(editingExpense.occurredAt).toISOString().split("T")[0]
            : todayISO()}
          className="input" />
      </div>

      <div>
        <label className="label">Descrição *</label>
        <input type="text" name="description" required className="input"
          placeholder="Ex: Compra de câmaras de ar"
          defaultValue={editingExpense?.description ?? ""} />
      </div>

      <div>
        <label className="label">Categoria *</label>
        <select name="categoryId" required className="select" defaultValue={editingExpense?.categoryId ?? ""}>
          <option value="">Selecione...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Valor (R$) *</label>
        <input type="number" name="amount" required min="0" step="0.01"
          className="input" placeholder="0,00" inputMode="decimal"
          defaultValue={editingExpense ? String(editingExpense.amount) : ""} />
      </div>

      <div>
        <label className="label">Forma de Pagamento *</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "CASH", label: "Dinheiro" },
            { value: "PIX",  label: "PIX" },
            { value: "CARD", label: "Cartão" },
          ].map((pm) => (
            <label key={pm.value}
              className="flex flex-col items-center justify-center border-2 border-gray-200 rounded-xl py-3 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition-colors">
              <input type="radio" name="paymentMethod" value={pm.value} className="sr-only"
                checked={selectedPayment === pm.value}
                onChange={() => setSelectedPayment(pm.value)} required />
              <span className="text-sm font-medium">{pm.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Nota Fiscal</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "false", label: "Sem nota" },
            { value: "true",  label: "Com nota" },
          ].map((opt) => (
            <label key={opt.value}
              className="flex items-center justify-center border-2 border-gray-200 rounded-xl py-3 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition-colors">
              <input type="radio" name="hasReceipt" value={opt.value} className="sr-only"
                checked={hasReceipt === (opt.value === "true")}
                onChange={() => setHasReceipt(opt.value === "true")} />
              <span className="text-sm font-medium">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Observação (opcional)</label>
        <textarea name="notes" className="input resize-none" rows={2}
          placeholder="Anotações adicionais..."
          defaultValue={editingExpense?.notes ?? ""} />
      </div>

      <SubmitButton label={isEdit ? "Salvar Alterações" : "Salvar Despesa"} />
    </form>
  );
}
