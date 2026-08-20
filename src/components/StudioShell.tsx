"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Home,
  Images,
  Users,
  Sparkles,
  Library,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/scenes", label: "Scenes", icon: Images },
  { href: "/people", label: "Your people", icon: Users },
  { href: "/create", label: "Free play", icon: Sparkles },
  { href: "/library", label: "Library", icon: Library },
  { href: "/account", label: "Account", icon: Settings },
];

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1">
      <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
        Studio
      </div>
      {NAV.slice(0, 4).map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "bg-[var(--accent-soft)] text-[var(--accent-2)] border border-[#E8D0D2]"
                : "text-[var(--text)] hover:bg-[var(--accent-soft)]/60"
            )}
          >
            <Icon size={18} strokeWidth={2} />
            {item.label}
          </Link>
        );
      })}

      <div className="px-3 py-2 mt-4 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
        You
      </div>
      {NAV.slice(4).map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "bg-[var(--accent-soft)] text-[var(--accent-2)] border border-[#E8D0D2]"
                : "text-[var(--text)] hover:bg-[var(--accent-soft)]/60"
            )}
          >
            <Icon size={18} strokeWidth={2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col border-r border-[var(--line)] bg-gradient-to-b from-white to-[#fff5f8] px-4 py-5">
        <div className="flex items-center gap-3 px-2 pb-5 mb-2 border-b border-[var(--line)]">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white text-sm font-extrabold"
            style={{
              background: "linear-gradient(135deg, #8B4A54, #7A3E48, #5C2E36)",
            }}
          >
            OC
          </div>
          <div>
            <div
              className="text-lg font-medium leading-tight"
              style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
            >
              Only Couples
            </div>
            <div className="text-[11px] text-[var(--muted)] font-medium">
              Private erotic studio
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] transition-colors"
        >
          <LogOut size={18} />
          Log out
        </button>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--panel)]/95 backdrop-blur px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-white"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div
            className="text-base font-medium"
            style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
          >
            Only Couples
          </div>
          <div className="w-10" /> {/* spacer */}
        </header>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-xl flex flex-col px-4 py-5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white text-sm font-extrabold"
                    style={{
                      background: "linear-gradient(135deg, #8B4A54, #7A3E48, #5C2E36)",
                    }}
                  >
                    OC
                  </div>
                  <span
                    className="text-lg font-medium"
                    style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
                  >
                    Only Couples
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-[var(--accent-soft)]"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </div>
              <button
                onClick={handleLogout}
                className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--muted)]"
              >
                <LogOut size={18} />
                Log out
              </button>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 px-4 py-5 md:px-8 md:py-7 max-w-5xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
