"use client";

import { useTransition, useRef } from "react";
import {
  createServiceType,
  toggleServiceType,
  createCategory,
  toggleCategory,
} from "@/app/actions/settings";
import { ServiceType, ExpenseCategory } from "@prisma/client";
import { Plus, Loader2 } from "lucide-react";

function AddForm({
  label,
  action,
}: {
  label: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      action={(fd) => {
        startTransition(async () => {
          await action(fd);
          ref.current?.reset();
        });
      }}
      className="flex gap-2"
    >
      <input
        type="text"
        name="name"
        required
        placeholder={`Novo(a) ${label}...`}
        className="input flex-1"
      />
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium text-sm disabled:opacity-50"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        Add
      </button>
    </form>
  );
}

function ToggleItem({
  id,
  name,
  active,
  onToggle,
}: {
  id: string;
  name: string;
  active: boolean;
  onToggle: (id: string, active: boolean) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className={`flex items-center justify-between py-2 border-b border-gray-100 last:border-0 ${isPending ? "opacity-50" : ""}`}>
      <span className={`text-sm ${active ? "text-gray-800" : "text-gray-400 line-through"}`}>
        {name}
      </span>
      <button
        onClick={() => startTransition(() => onToggle(id, !active))}
        disabled={isPending}
        className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
          active
            ? "bg-green-100 text-green-700 active:bg-green-200"
            : "bg-gray-100 text-gray-500 active:bg-gray-200"
        }`}
      >
        {active ? "Ativo" : "Inativo"}
      </button>
    </div>
  );
}

export function SettingsView({
  serviceTypes,
  categories,
}: {
  serviceTypes: ServiceType[];
  categories: ExpenseCategory[];
}) {
  return (
    <div className="space-y-6">
      {/* Tipos de Serviço */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-800 text-base">Tipos de Serviço</h2>
        <AddForm label="tipo de serviço" action={createServiceType} />
        <div>
          {serviceTypes.map((st) => (
            <ToggleItem
              key={st.id}
              id={st.id}
              name={st.name}
              active={st.active}
              onToggle={toggleServiceType}
            />
          ))}
        </div>
      </div>

      {/* Categorias de Despesa */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-800 text-base">Categorias de Despesa</h2>
        <AddForm label="categoria" action={createCategory} />
        <div>
          {categories.map((cat) => (
            <ToggleItem
              key={cat.id}
              id={cat.id}
              name={cat.name}
              active={cat.active}
              onToggle={toggleCategory}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
