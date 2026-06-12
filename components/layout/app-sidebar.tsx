"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/appointments", label: "Ραντεβού" },
  { href: "/appointments/new", label: "Νέο ραντεβού" },
  { href: "/clients", label: "Πελάτες" },
  { href: "/day-schedule", label: "Πρόγραμμα ημέρας" },
  { href: "/performance", label: "Επίδοση" },
  { href: "/logs", label: "Logs" },
  { href: "/settings", label: "Ρυθμίσεις" },
];

export function AppSidebar() {
  const pathname = usePathname();

  function isItemActive(href: string) {
    if (href === "/appointments") {
      return pathname === "/appointments";
    }

    if (href === "/appointments/new") {
      return pathname === "/appointments/new";
    }

    if (href === "/clients") {
      return pathname === "/clients" || pathname.startsWith("/clients/");
    }

    return pathname === href;
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-[#e3dfeb] bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:hidden">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold text-[#242034]">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#302a47] text-xs font-semibold text-white">
              R
            </span>
            <span>RemindMeUp</span>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="secondary-action rounded-lg px-3 py-2 text-xs font-medium"
            >
              Αποσύνδεση
            </button>
          </form>
        </div>

        <nav className="mobile-nav -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition",
                isItemActive(item.href)
                  ? "border-[#e4def3] bg-[#efebfb] text-[#302a47]"
                  : "border-[#e3dfeb] bg-white text-[#625d72]"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <aside className="hidden w-64 shrink-0 border-r border-[#e5e0ec] bg-white/75 p-5 text-[#2c273e] backdrop-blur md:block">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-[#ebe7f1] pb-6">
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-[#302a47] text-base font-semibold text-white">
              R
            </span>
            <div>
              <p className="text-base font-semibold text-[#242034]">RemindMeUp</p>
              <p className="text-xs text-[#756f83]">Workspace</p>
            </div>
          </div>

          <nav className="mt-7 space-y-1.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-lg border px-4 py-3 text-sm font-medium transition",
                  isItemActive(item.href)
                    ? "border-[#e4def3] bg-[#efebfb] text-[#302a47]"
                    : "border-transparent text-[#696579] hover:border-[#ece8f2] hover:bg-[#f8f6fc] hover:text-[#302a47]"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <form action={signOut} className="mt-auto border-t border-[#ebe7f1] pt-5">
            <button
              type="submit"
              className="secondary-action w-full rounded-lg px-4 py-3 text-sm font-medium"
            >
              Αποσύνδεση
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
