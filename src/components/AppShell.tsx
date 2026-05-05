import { BottomNav } from "@/components/BottomNav";
import { FlashMessage } from "@/components/FlashMessage";
import { getFlash } from "@/lib/flash";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const flash = await getFlash();

  return (
    <div className="min-h-screen bg-gray-50">
      {flash && <FlashMessage message={flash.message} type={flash.type} />}
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
