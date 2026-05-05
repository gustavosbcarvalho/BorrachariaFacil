"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function AdminHeader({ name }: { name: string }) {
  return (
    <header className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <div>
        <p className="font-bold text-sm">Borracharia Fácil</p>
        <p className="text-gray-400 text-xs">{name}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs bg-yellow-500 text-gray-900 font-semibold px-2 py-1 rounded-full">
          SYSTEM ADMIN
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-2 rounded-lg text-gray-400 active:text-white active:bg-gray-700 transition-colors"
          aria-label="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
