import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/AdminHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.user.role !== "SYSTEM_ADMIN") redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader name={session.user.name} />
      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
