"use client";

import {
  formatCurrency, formatDateTime,
  PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS,
} from "@/lib/utils";
import { updateServiceStatus, deleteService } from "@/app/actions/services";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { useTransition } from "react";

type ServiceWithRelations = {
  id: string;
  description: string | null;
  vehiclePlate: string | null;
  amount: number;
  amountDue: number;
  paymentMethod: string;
  paymentStatus: string;
  occurredAt: string;
  serviceType: { name: string };
  user: { name: string };
};

function ServiceCard({ service }: { service: ServiceWithRelations }) {
  const [isPending, startTransition] = useTransition();

  const markAsPaid = () =>
    startTransition(() => updateServiceStatus(service.id, "PAID"));

  const handleDelete = () => {
    if (!confirm("Excluir este serviço?")) return;
    startTransition(() => deleteService(service.id));
  };

  return (
    <div className={`card space-y-2 ${isPending ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{service.serviceType.name}</p>
          {service.vehiclePlate && (
            <p className="text-xs font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded inline-block mt-0.5">
              {service.vehiclePlate}
            </p>
          )}
          {service.description && (
            <p className="text-sm text-gray-500 truncate">{service.description}</p>
          )}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${PAYMENT_STATUS_COLORS[service.paymentStatus]}`}>
          {PAYMENT_STATUS_LABELS[service.paymentStatus]}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-green-700">
          {formatCurrency(Number(service.amount))}
        </span>
        <span className="text-sm text-gray-500">{PAYMENT_METHOD_LABELS[service.paymentMethod]}</span>
      </div>

      {Number(service.amountDue) > 0 && (
        <p className="text-sm text-orange-600 font-medium">
          Em aberto: {formatCurrency(Number(service.amountDue))}
        </p>
      )}

      <div className="text-xs text-gray-400">
        {formatDateTime(service.occurredAt)} · {service.user.name}
      </div>

      <div className="flex gap-2">
        <Link href={`/services/${service.id}/edit`}
          className="flex-1 flex items-center justify-center gap-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg">
          <Pencil className="w-3.5 h-3.5" /> Editar
        </Link>
        {(service.paymentStatus === "PENDING" || service.paymentStatus === "PARTIAL") && (
          <button onClick={markAsPaid} disabled={isPending}
            className="flex-1 py-2 rounded-lg bg-green-600 text-white text-sm font-medium active:bg-green-700 disabled:opacity-50">
            Marcar Pago
          </button>
        )}
        <button onClick={handleDelete} disabled={isPending}
          className="px-3 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-200 disabled:opacity-50">
          ✕
        </button>
      </div>
    </div>
  );
}

export function ServiceList({ services }: { services: ServiceWithRelations[] }) {
  if (services.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">🔧</p>
        <p className="font-medium">Nenhum serviço registrado</p>
        <Link href="/services/new" className="btn-primary mt-6 inline-flex w-auto px-8">
          <Plus className="w-5 h-5" /> Novo Serviço
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{services.length} serviço(s)</p>
        <Link href="/services/new"
          className="flex items-center gap-1 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
          <Plus className="w-4 h-4" /> Novo
        </Link>
      </div>
      {services.map((s) => <ServiceCard key={s.id} service={s} />)}
    </div>
  );
}
