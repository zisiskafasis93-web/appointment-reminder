"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/appointments", label: "Ραντεβού" },
  { href: "/appointments/new", label: "Νέο ραντεβού" },
  { href: "/logs", label: "Logs" },
  { href: "/settings", label: "Ρυθμίσεις" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r bg-white p-6 md:block">
      <div className="flex h-full flex-col">
        <div>
          <p className="text-sm text-slate-500">Appointment Reminder</p>
          <h2 className="mt-2 text-xl font-semibold">Control Panel</h2>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/appointments"
                ? pathname === "/appointments" || pathname.startsWith("/appointments/")
                : pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
  "block rounded-2xl px-4 py-3 text-sm font-medium transition",
  isActive
    ? "bg-slate-100 text-slate-900 ring-1 ring-slate-200"
    : "text-slate-700 hover:bg-slate-100"
)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action={signOut} className="mt-auto">
          <button
            type="submit"
            className="w-full rounded-2xl border px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Αποσύνδεση
          </button>
        </form>
      </div>
    </aside>
  );
}