"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
      <div className="min-w-0">
        <h1 className="text-base font-bold leading-tight truncate">{title}</h1>
        {session?.user && (
          <p className="text-blue-200 text-xs truncate">
            {session.user.borrachariaName
              ? `${session.user.borrachariaName} · ${session.user.name}`
              : session.user.name}
          </p>
        )}
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="p-2 rounded-lg active:bg-blue-700 transition-colors flex-shrink-0"
        aria-label="Sair"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </header>
  );
}
