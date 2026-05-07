"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

type ServiceWithType = {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  serviceType: { name: string };
};

type ExpenseWithCategory = {
  id: string;
  amount: number;
  paymentMethod: string;
  hasReceipt: boolean;
  category: { name: string };
};

interface ReportData {
  dayServices: ServiceWithType[];
  weekServices: ServiceWithType[];
  monthServices: ServiceWithType[];
  dayExpenses: ExpenseWithCategory[];
  weekExpenses: ExpenseWithCategory[];
  monthExpenses: ExpenseWithCategory[];
}

function computeReport(services: ServiceWithType[], expenses: ExpenseWithCategory[]) {
  const paidServices = services.filter((s) => s.paymentStatus !== "COURTESY");
  const pendingServices = services.filter((s) => s.paymentStatus === "PENDING");

  const totalIncome = paidServices.reduce((acc, s) => acc + s.amount, 0);
  const pendingAmount = pendingServices.reduce((acc, s) => acc + s.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  // Por forma de pagamento (entradas)
  const byPayment: Record<string, number> = {};
  for (const s of paidServices) {
    byPayment[s.paymentMethod] = (byPayment[s.paymentMethod] ?? 0) + s.amount;
  }

  // Por categoria (despesas)
  const byCategory: Record<string, number> = {};
  for (const e of expenses) {
    byCategory[e.category.name] = (byCategory[e.category.name] ?? 0) + e.amount;
  }

  // Serviços mais executados
  const byServiceType: Record<string, number> = {};
  for (const s of services) {
    byServiceType[s.serviceType.name] = (byServiceType[s.serviceType.name] ?? 0) + 1;
  }

  // NF
  const withReceipt = expenses.filter((e) => e.hasReceipt).reduce((acc, e) => acc + e.amount, 0);
  const withoutReceipt = expenses.filter((e) => !e.hasReceipt).reduce((acc, e) => acc + e.amount, 0);

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    pendingAmount,
    serviceCount: services.length,
    byPayment,
    byCategory,
    byServiceType,
    withReceipt,
    withoutReceipt,
  };
}

const PAYMENT_LABELS: Record<string, string> = { CASH: "Dinheiro", PIX: "PIX", CARD: "Cartão" };
const PERIOD_LABELS = ["Hoje", "Semana", "Mês"];

function ReportSection({ report }: { report: ReturnType<typeof computeReport> }) {
  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card text-center">
          <p className="text-xs text-gray-500 mb-1">Entradas</p>
          <p className="text-lg font-bold text-green-700">{formatCurrency(report.totalIncome)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 mb-1">Gastos</p>
          <p className="text-lg font-bold text-red-600">{formatCurrency(report.totalExpenses)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500 mb-1">Saldo</p>
          <p className={`text-lg font-bold ${report.balance >= 0 ? "text-blue-700" : "text-orange-600"}`}>
            {formatCurrency(report.balance)}
          </p>
        </div>
      </div>

      {report.pendingAmount > 0 && (
        <div className="card border-l-4 border-yellow-400">
          <p className="text-sm font-medium text-yellow-700">
            Pendente de recebimento: {formatCurrency(report.pendingAmount)}
          </p>
        </div>
      )}

      {/* Entradas por pagamento */}
      {Object.keys(report.byPayment).length > 0 && (
        <div className="card">
          <p className="text-sm font-semibold text-gray-700 mb-3">Entradas por forma de pagamento</p>
          <div className="space-y-2">
            {Object.entries(report.byPayment)
              .sort(([, a], [, b]) => b - a)
              .map(([method, value]) => (
                <div key={method} className="flex justify-between text-sm">
                  <span className="text-gray-600">{PAYMENT_LABELS[method] ?? method}</span>
                  <span className="font-semibold text-green-700">{formatCurrency(value)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Serviços mais executados */}
      {Object.keys(report.byServiceType).length > 0 && (
        <div className="card">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Serviços executados ({report.serviceCount} no total)
          </p>
          <div className="space-y-2">
            {Object.entries(report.byServiceType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-gray-600">{type}</span>
                  <span className="font-semibold">{count}x</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Gastos por categoria */}
      {Object.keys(report.byCategory).length > 0 && (
        <div className="card">
          <p className="text-sm font-semibold text-gray-700 mb-3">Gastos por categoria</p>
          <div className="space-y-2">
            {Object.entries(report.byCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, value]) => (
                <div key={cat} className="flex justify-between text-sm">
                  <span className="text-gray-600">{cat}</span>
                  <span className="font-semibold text-red-600">{formatCurrency(value)}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Nota fiscal */}
      {report.totalExpenses > 0 && (
        <div className="card">
          <p className="text-sm font-semibold text-gray-700 mb-3">Gastos por nota fiscal</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Com nota fiscal</span>
              <span className="font-semibold text-blue-700">{formatCurrency(report.withReceipt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sem nota fiscal</span>
              <span className="font-semibold text-gray-700">{formatCurrency(report.withoutReceipt)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ReportView({ data }: { data: ReportData }) {
  const [period, setPeriod] = useState(0);

  const sets = [
    { services: data.dayServices, expenses: data.dayExpenses },
    { services: data.weekServices, expenses: data.weekExpenses },
    { services: data.monthServices, expenses: data.monthExpenses },
  ];

  const report = computeReport(sets[period].services, sets[period].expenses);

  return (
    <div className="space-y-4">
      {/* Seletor de período */}
      <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl">
        {PERIOD_LABELS.map((label, i) => (
          <button
            key={label}
            onClick={() => setPeriod(i)}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
              period === i
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ReportSection report={report} />
    </div>
  );
}
