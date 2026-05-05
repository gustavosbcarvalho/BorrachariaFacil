"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wrench,
  Receipt,
  BarChart3,
  Settings,
} from "lucide-react";
import { useSession } from "next-auth/react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Início" },
  { href: "/services/new", icon: Wrench, label: "Serviço" },
  { href: "/expenses/new", icon: Receipt, label: "Despesa" },
  { href: "/reports", icon: BarChart3, label: "Relatórios", adminOnly: true },
  { href: "/settings", icon: Settings, label: "Config", adminOnly: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const visible = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex">
        {visible.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/services/new" &&
              item.href !== "/expenses/new" &&
              pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 px-1 text-xs font-medium transition-colors ${
                active ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <Icon className={`w-6 h-6 mb-0.5 ${active ? "text-blue-600" : "text-gray-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
