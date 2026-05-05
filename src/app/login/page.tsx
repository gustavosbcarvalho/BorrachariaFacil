"use client";

import { useState, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Search, MapPin, ChevronRight, ArrowLeft, Wrench } from "lucide-react";

type Borracharia = { id: string; name: string; city: string; state: string };
type Step = "select" | "login" | "admin";

const STORAGE_KEY = "borracharia_selecionada";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<Borracharia | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Borracharia[]>([]);
  const [searching, setSearching] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Recupera borracharia salva no localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Borracharia;
        setSelected(parsed);
        setStep("login");
      }
    } catch {
      // ignora erro de parse
    }
  }, []);

  // Busca borracharias com debounce
  const search = useCallback(async (q: string) => {
    setSearching(true);
    try {
      const res = await fetch(`/api/borracharias?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Carrega todas ao abrir a tela de seleção
  useEffect(() => {
    if (step === "select") search("");
  }, [step, search]);

  function selectBorracharia(b: Borracharia) {
    setSelected(b);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
    setStep("login");
    setError("");
  }

  function changeBorracharia() {
    setSelected(null);
    localStorage.removeItem(STORAGE_KEY);
    setStep("select");
    setQuery("");
    setError("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const borrachariaId = step === "admin" ? "" : (selected?.id ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      borrachariaId,
      redirect: false,
    });

    if (result?.error) {
      setError(
        step === "admin"
          ? "Credenciais inválidas."
          : "Email ou senha incorretos, ou usuário não pertence a esta borracharia."
      );
      setLoading(false);
    } else {
      // Middleware cuida do redirecionamento correto por role
      router.push("/");
      router.refresh();
    }
  }

  // ─── Tela de seleção de borracharia ──────────────────────────────────────
  if (step === "select") {
    return (
      <div className="min-h-screen bg-blue-600 flex flex-col p-4">
        <div className="text-center py-6">
          <div className="text-4xl mb-2">🔧</div>
          <h1 className="text-2xl font-bold text-white">Borracharia Fácil</h1>
          <p className="text-blue-200 text-sm mt-1">Selecione sua borracharia</p>
        </div>

        <div className="bg-white rounded-xl p-4 flex-1 flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar borracharia..."
              className="input pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          {searching && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          )}

          <div className="flex-1 space-y-2 overflow-y-auto">
            {results.length === 0 && !searching && (
              <p className="text-center text-gray-400 py-8 text-sm">
                {query ? "Nenhuma borracharia encontrada." : "Nenhuma borracharia cadastrada."}
              </p>
            )}
            {results.map((b) => (
              <button
                key={b.id}
                onClick={() => selectBorracharia(b)}
                className="w-full text-left card flex items-center justify-between gap-3 active:bg-blue-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{b.name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {b.city}, {b.state}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep("admin")}
            className="text-center text-sm text-gray-400 py-2 active:text-gray-600"
          >
            Acesso administrativo do sistema
          </button>
        </div>
      </div>
    );
  }

  // ─── Tela de login (borracharia selecionada ou admin) ─────────────────────
  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Borracharia selecionada (ou modo admin) */}
        {step === "login" && selected ? (
          <button
            onClick={changeBorracharia}
            className="w-full flex items-center gap-3 bg-blue-700 rounded-xl px-4 py-3 active:bg-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-blue-200 flex-shrink-0" />
            <div className="min-w-0 text-left">
              <p className="text-white font-semibold truncate">{selected.name}</p>
              <p className="text-blue-300 text-xs">
                {selected.city}, {selected.state} · Toque para trocar
              </p>
            </div>
          </button>
        ) : (
          <div className="text-center">
            <p className="text-white font-semibold">Admin do Sistema</p>
            <button
              onClick={() => setStep("select")}
              className="text-blue-300 text-sm underline"
            >
              Voltar para seleção de borracharia
            </button>
          </div>
        )}

        {/* Card de login */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Entrar
          </h2>
          {step === "login" && (
            <p className="text-xs text-center text-gray-400 mb-4 -mt-2">
              Admin do sistema?{" "}
              <button
                type="button"
                onClick={() => { setStep("admin"); setError(""); }}
                className="text-blue-500 underline"
              >
                Acesse aqui
              </button>
            </p>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                autoComplete="email"
                required
                className="input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <input
                type="password"
                autoComplete="current-password"
                required
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Entrando...</>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
