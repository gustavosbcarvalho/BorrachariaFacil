"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createService } from "@/app/actions/services";
import { todayISO } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ServiceType } from "@prisma/client";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary mt-2">
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Salvando...
        </>
      ) : (
        "Salvar Serviço"
      )}
    </button>
  );
}

export function ServiceForm({ serviceTypes }: { serviceTypes: ServiceType[] }) {
  const [selectedStatus, setSelectedStatus] = useState("PAID");

  return (
    <form action={createService} className="space-y-4">
      {/* Data/Hora */}
      <div>
        <label className="label">Data e Hora *</label>
        <input
          type="datetime-local"
          name="occurredAt"
          required
          defaultValue={`${todayISO()}T${new Date().toTimeString().slice(0, 5)}`}
          className="input"
        />
      </div>

      {/* Tipo de Serviço */}
      <div>
        <label className="label">Tipo de Serviço *</label>
        <select name="serviceTypeId" required className="select">
          <option value="">Selecione...</option>
          {serviceTypes.map((st) => (
            <option key={st.id} value={st.id}>
              {st.name}
            </option>
          ))}
        </select>
      </div>

      {/* Descrição */}
      <div>
        <label className="label">Descrição (opcional)</label>
        <input
          type="text"
          name="description"
          className="input"
          placeholder="Ex: Pneu 175/65 R14 — meia vida"
        />
      </div>

      {/* Valor */}
      <div>
        <label className="label">Valor Cobrado (R$) *</label>
        <input
          type="number"
          name="amount"
          required
          min="0"
          step="0.01"
          className="input"
          placeholder="0,00"
          inputMode="decimal"
        />
      </div>

      {/* Forma de Pagamento */}
      <div>
        <label className="label">Forma de Pagamento *</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "CASH", label: "Dinheiro" },
            { value: "PIX", label: "PIX" },
            { value: "CARD", label: "Cartão" },
          ].map((pm) => (
            <label
              key={pm.value}
              className="flex flex-col items-center justify-center border-2 border-gray-200 rounded-xl py-3 cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 transition-colors"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={pm.value}
                className="sr-only"
                defaultChecked={pm.value === "CASH"}
                required
              />
              <span className="text-sm font-medium">{pm.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="label">Status *</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "PAID", label: "Pago", color: "has-[:checked]:border-green-500 has-[:checked]:bg-green-50" },
            { value: "PENDING", label: "Pendente", color: "has-[:checked]:border-yellow-500 has-[:checked]:bg-yellow-50" },
            { value: "COURTESY", label: "Cortesia", color: "has-[:checked]:border-gray-400 has-[:checked]:bg-gray-50" },
          ].map((s) => (
            <label
              key={s.value}
              className={`flex flex-col items-center justify-center border-2 border-gray-200 rounded-xl py-3 cursor-pointer ${s.color} transition-colors`}
            >
              <input
                type="radio"
                name="paymentStatus"
                value={s.value}
                className="sr-only"
                checked={selectedStatus === s.value}
                onChange={() => setSelectedStatus(s.value)}
                required
              />
              <span className="text-sm font-medium">{s.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Observação */}
      <div>
        <label className="label">Observação (opcional)</label>
        <textarea
          name="notes"
          className="input resize-none"
          rows={3}
          placeholder="Anotações adicionais..."
        />
      </div>

      <SubmitButton />
    </form>
  );
}
