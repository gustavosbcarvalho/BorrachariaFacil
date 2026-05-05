import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.user.role !== "SYSTEM_ADMIN") redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-bold text-sm">Borracharia Fácil</p>
          <p className="text-gray-400 text-xs">Painel Administrativo</p>
        </div>
        <span className="text-xs bg-yellow-500 text-gray-900 font-semibold px-2 py-1 rounded-full">
          SYSTEM ADMIN
        </span>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
