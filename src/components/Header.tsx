"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, UserCircle } from "lucide-react";
import Link from "next/link";

export function Header({ title }: { title: string }) {
  const { data: session } = useSession();

  return (
    <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
      <div className="min-w-0 flex-1">
        <h1 className="text-base font-bold leading-tight truncate">{title}</h1>
        {session?.user && (
          <p className="text-blue-200 text-xs truncate">
            {session.user.borrachariaName
              ? `${session.user.borrachariaName} · ${session.user.name}`
              : session.user.name}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Link href="/profile"
          className="p-2 rounded-lg active:bg-blue-700 transition-colors"
          aria-label="Meu perfil">
          <UserCircle className="w-5 h-5" />
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-2 rounded-lg active:bg-blue-700 transition-colors"
          aria-label="Sair">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
