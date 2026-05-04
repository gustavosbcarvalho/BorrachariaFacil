"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="bg-blue-600 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
      <div>
        <h1 className="text-lg font-bold leading-tight">{title}</h1>
        {session?.user && (
          <p className="text-blue-200 text-xs">{session.user.name}</p>
        )}
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="p-2 rounded-lg active:bg-blue-700 transition-colors"
        aria-label="Sair"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </header>
  );
}
