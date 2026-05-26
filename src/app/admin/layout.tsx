import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/AdminHeader";
import { FlashMessage } from "@/components/FlashMessage";
import { getFlash } from "@/lib/flash";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.user.role !== "SYSTEM_ADMIN") redirect("/login");
  const flash = await getFlash();

  return (
    <div className="min-h-screen bg-gray-50">
      {flash && <FlashMessage message={flash.message} type={flash.type} />}
      <AdminHeader name={session.user.name} />
      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
