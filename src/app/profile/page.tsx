import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { AdminHeader } from "@/components/AdminHeader";
import { changePassword } from "@/app/actions/profile";
import { FlashMessage } from "@/components/FlashMessage";
import { getFlash } from "@/lib/flash";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const isSystemAdmin = session.user.role === "SYSTEM_ADMIN";

  const form = (
    <div className="px-4 py-4 max-w-sm mx-auto">
      <form action={changePassword} className="space-y-4">
        <div>
          <label className="label">Senha atual *</label>
          <input type="password" name="currentPassword" required className="input" autoComplete="current-password" />
        </div>
        <div>
          <label className="label">Nova senha *</label>
          <input type="password" name="newPassword" required minLength={6} className="input" autoComplete="new-password" />
        </div>
        <div>
          <label className="label">Confirmar nova senha *</label>
          <input type="password" name="confirmPassword" required minLength={6} className="input" autoComplete="new-password" />
        </div>
        <button type="submit" className="btn-primary">Alterar Senha</button>
      </form>
    </div>
  );

  if (isSystemAdmin) {
    const flash = await getFlash();

    return (
      <div className="min-h-screen bg-gray-50">
        {flash && <FlashMessage message={flash.message} type={flash.type} />}
        <AdminHeader name={session.user.name} />
        <main className="max-w-sm mx-auto px-4 py-6">
          <h1 className="text-lg font-bold text-gray-900 mb-4">Alterar Senha</h1>
          {form}
        </main>
      </div>
    );
  }

  return (
    <AppShell>
      <Header title="Alterar Senha" />
      {form}
    </AppShell>
  );
}
