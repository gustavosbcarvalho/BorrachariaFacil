export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Dinheiro",
  PIX: "PIX",
  CARD: "Cartão",
  CONVENIO: "Convênio",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PAID: "Pago",
  PARTIAL: "Parcial",
  PENDING: "Pendente",
  COURTESY: "Cortesia",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PAID: "bg-green-100 text-green-800",
  PARTIAL: "bg-orange-100 text-orange-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  COURTESY: "bg-gray-100 text-gray-600",
};

export const PAYMENT_FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: "Semanal",
  BIWEEKLY: "Quinzenal",
  MONTHLY: "Mensal",
};
