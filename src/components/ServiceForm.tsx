"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createService, updateService } from "@/app/actions/services";
import { todayISO } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ServiceType, Convenio } from "@prisma/client";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary mt-2">
      {pending ? <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</> : label}
    </button>
  );
}

interface EditingService {
  id: string;
  serviceTypeId: string;
  description: string | null;
  vehiclePlate: string | null;
  amount: unknown;
  paymentMethod: string;
  paymentStatus: string;
  convenioId: string | null;
  notes: string | null;
  occurredAt: Date;
}

interface Props {
  serviceTypes: ServiceType[];
  convenios: Convenio[];
  editingService?: EditingService;
}

export function ServiceForm({ serviceTypes, convenios, editingService }: Props) {
  const isEdit = !!editingService;
  const [selectedPayment, setSelectedPayment] = useState(editingService?.paymentMethod ?? "CASH");
  const [selectedStatus, setSelectedStatus]   = useState(editingService?.paymentStatus ?? "PAID");
  const isConvenio = selectedPayment === "CONVENIO";

  const action = isEdit
    ? updateService.bind(null, editingService!.id)
    : createService;

  const defaultDate = editingService
    ? new Date(editingService.occurredAt).toISOString().slice(0, 16)
    : `${todayISO()}T${new Date().toTimeString().slice(0, 5)}`;

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label">Data e Hora *</label>
        <input type="datetime-local" name="occurredAt" required defaultValue={defaultDate} className="input" />
      </div>

      <div>
        <label className="label">Tipo de Serviço *</label>
        <select name="serviceTypeId" required className="select" defaultValue={editingService?.serviceTypeId ?? ""}>
          <option value="">Selecione...</option>
          {serviceTypes.map((st) => (
            <option key={st.id} value={st.id}>{st.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Placa do Veículo</label>
        <input
          type="text" name="vehiclePlate"
          className="input uppercase" placeholder="ABC-1234 ou ABC1D23"
          defaultValue={editingService?.vehiclePlate ?? ""}
          maxLength={8}
          style={{ textTransform: "uppercase" }}
        />
      </div>

      <div>
        <label className="label">Descrição (opcional)</label>
        <input type="text" name="description" className="input" placeholder="Ex: Pneu 175/65 R14"
          defaultValue={editingService?.description ?? ""} />
      </div>

      <div>
        <label className="label">Valor Cobrado (R$) *</label>
        <input type="number" name="amount" required min="0" step="0.01"
          className="input" placeholder="0,00" inputMode="decimal"
          defaultValue={editingService ? String(editingService.amount) : ""} />
      </div>

      <div>
        <label className="label">Forma de Pagamento *</label>
        <div className={`grid gap-2 ${convenios.length > 0 ? "grid-cols-2" : "grid-cols-3"}`}>
          {[
            { value: "CASH", label: "Dinheiro" },
            { value: "PIX",  label: "PIX" },
            { value: "CARD", label: "Cartão" },
            ...(convenios.length > 0 ? [{ value: "CONVENIO", label: "Convênio" }] : []),
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

      {isConvenio && (
        <div>
          <label className="label">Empresa do Convênio *</label>
          <select name="convenioId" required className="select" defaultValue={editingService?.convenioId ?? ""}>
            <option value="">Selecione a empresa...</option>
            {convenios.map((c) => (
              <option key={c.id} value={c.id}>{c.companyName}</option>
            ))}
          </select>
          <p className="text-xs text-blue-600 mt-1">Pendente até o dia do pagamento.</p>
        </div>
      )}

      {!isConvenio && (
        <div>
          <label className="label">Status *</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "PAID",     label: "Pago",     color: "has-[:checked]:border-green-500 has-[:checked]:bg-green-50" },
              { value: "PENDING",  label: "Pendente", color: "has-[:checked]:border-yellow-500 has-[:checked]:bg-yellow-50" },
              { value: "COURTESY", label: "Cortesia", color: "has-[:checked]:border-gray-400 has-[:checked]:bg-gray-50" },
            ].map((s) => (
              <label key={s.value}
                className={`flex flex-col items-center justify-center border-2 border-gray-200 rounded-xl py-3 cursor-pointer ${s.color} transition-colors`}>
                <input type="radio" name="paymentStatus" value={s.value} className="sr-only"
                  checked={selectedStatus === s.value}
                  onChange={() => setSelectedStatus(s.value)} required />
                <span className="text-sm font-medium">{s.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {isConvenio && <input type="hidden" name="paymentStatus" value="PENDING" />}

      <div>
        <label className="label">Observação (opcional)</label>
        <textarea name="notes" className="input resize-none" rows={2}
          placeholder="Anotações adicionais..."
          defaultValue={editingService?.notes ?? ""} />
      </div>

      <SubmitButton label={isEdit ? "Salvar Alterações" : "Salvar Serviço"} />
    </form>
  );
}
