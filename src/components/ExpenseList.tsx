"use client";

import {
  formatCurrency,
  formatDate,
  PAYMENT_METHOD_LABELS,
} from "@/lib/utils";
import { deleteExpense } from "@/app/actions/expenses";
import Link from "next/link";
import { Plus, FileText, X } from "lucide-react";
import { useTransition } from "react";

type ExpenseWithRelations = {
  id: string;
  description: string;
  amount: unknown;
  paymentMethod: string;
  hasReceipt: boolean;
  notes: string | null;
  occurredAt: Date;
  category: { name: string };
  user: { name: string };
};

function ExpenseCard({ expense }: { expense: ExpenseWithRelations }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Excluir esta despesa permanentemente?")) return;
    startTransition(() => deleteExpense(expense.id));
  };

  return (
    <div className={`card space-y-2 ${isPending ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{expense.description}</p>
          <p className="text-sm text-gray-500">{expense.category.name}</p>
        </div>
        <span
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full flex-shrink-0 ${
            expense.hasReceipt
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {expense.hasReceipt ? (
            <>
              <FileText className="w-3 h-3" /> Com NF
            </>
          ) : (
            <>
              <X className="w-3 h-3" /> Sem NF
            </>
          )}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-red-600">
          {formatCurrency(Number(expense.amount))}
        </span>
        <span className="text-sm text-gray-500">
          {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
        </span>
      </div>

      <div className="text-xs text-gray-400">
        {formatDate(expense.occurredAt)} · {expense.user.name}
      </div>

      <button
        onClick={handleDelete}
        disabled={isPending}
        className="w-full py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium active:bg-red-100 border border-red-200 disabled:opacity-50"
      >
        Excluir
      </button>
    </div>
  );
}

export function ExpenseList({ expenses }: { expenses: ExpenseWithRelations[] }) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">🧾</p>
        <p className="font-medium">Nenhuma despesa registrada</p>
        <Link
          href="/expenses/new"
          className="btn-primary mt-6 inline-flex w-auto px-8"
        >
          <Plus className="w-5 h-5" />
          Nova Despesa
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{expenses.length} despesa(s)</p>
        <Link
          href="/expenses/new"
          className="flex items-center gap-1 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" /> Nova
        </Link>
      </div>

      {expenses.map((expense) => (
        <ExpenseCard key={expense.id} expense={expense} />
      ))}
    </div>
  );
}
