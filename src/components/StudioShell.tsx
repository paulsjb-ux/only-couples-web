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
  UserPlus,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/scenes", label: "Scenes", icon: Images },
  { href: "/people", label: "Your people", icon: Users },
  { href: "/create", label: "Free play", icon: Sparkles },
  { href: "/library", label: "Library", icon: Library },
  { href: "/account", label: "Account", icon: Settings },
  { href: "/join", label: "Join partner", icon: UserPlus },
];

const TOR_MARK: React.CSSProperties = {
  background: "linear-gradient(135deg, #8B4A54, #7A3E48, #5C2E36)",
};

/**
 * Studio chrome — does NOT rely on Tailwind lg: breakpoints
 * (those often fail under Tailwind v4 if not scanned).
 * Uses matchMedia + explicit flex-direction: column for nav.
 */
export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      setIsDesktop(mq.matches);
      if (mq.matches) setMobileOpen(false);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          width: "100%",
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#8a7350",
          }}
        >
          Studio
        </div>
        {NAV.slice(0, 4).map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 12,
                fontSize: 14,
                textDecoration: "none",
                color: active ? "#1a1614" : "#5c534c",
                background: active ? "rgba(232, 208, 210, 0.55)" : "transparent",
                border: active
                  ? "1px solid #E8D0D2"
                  : "1px solid transparent",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <Icon size={18} strokeWidth={1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div
          style={{
            padding: "8px 12px",
            marginTop: 12,
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#8a7350",
          }}
        >
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
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 12,
                fontSize: 14,
                textDecoration: "none",
                color: active ? "#1a1614" : "#5c534c",
                background: active ? "rgba(232, 208, 210, 0.55)" : "transparent",
                border: active
                  ? "1px solid #E8D0D2"
                  : "1px solid transparent",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <Icon size={18} strokeWidth={1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  const sidebarInner = (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 8px 20px",
          marginBottom: 8,
          borderBottom: "1px solid rgba(26,22,20,0.1)",
        }}
      >
        <div
          style={{
            ...TOR_MARK,
            width: 40,
            height: 40,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 800,
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          TOR
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: 18,
              color: "#1a1614",
              lineHeight: 1.2,
            }}
          >
            The Other Room
          </div>
          <div style={{ fontSize: 11, color: "#5c534c" }}>
            A private studio for the two of you
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", width: "100%" }}>
        <NavLinks
          onNavigate={isDesktop ? undefined : () => setMobileOpen(false)}
        />
      </div>
      <button
        type="button"
        onClick={handleLogout}
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 12px",
          borderRadius: 12,
          border: "none",
          background: "transparent",
          color: "#5c534c",
          fontSize: 14,
          cursor: "pointer",
          width: "100%",
        }}
      >
        <LogOut size={18} strokeWidth={1.75} />
        Log out
      </button>
    </>
  );

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "row",
        background: "#faf7f5",
        color: "#1a1614",
      }}
    >
      {/* Desktop sidebar only when isDesktop */}
      {isDesktop && (
        <aside
          style={{
            width: 260,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            padding: "20px 16px",
            borderRight: "1px solid rgba(26,22,20,0.1)",
            background: "linear-gradient(to bottom, #ffffff, #fff5f8)",
          }}
        >
          {sidebarInner}
        </aside>
      )}

      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Mobile top bar */}
        {!isDesktop && (
          <header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid rgba(26,22,20,0.1)",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              aria-controls="studio-mobile-navigation"
              style={{
                ...TOR_MARK,
                width: 40,
                height: 40,
                borderRadius: 12,
                border: "none",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Menu size={20} />
            </button>
            <div
              id="studio-mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Studio navigation"
              style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: 16,
              }}
            >
              The Other Room
            </div>
            <div style={{ width: 40 }} />
          </header>
        )}

        {/* Mobile drawer */}
        {!isDesktop && mobileOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
            }}
          >
            <div
              role="presentation"
              onClick={() => setMobileOpen(false)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "min(280px, 85vw)",
                display: "flex",
                flexDirection: "column",
                padding: "20px 16px",
                background: "#fff",
                boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: 8,
                }}
              >
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: 8,
                    cursor: "pointer",
                    color: "#5c534c",
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              {sidebarInner}
            </div>
          </div>
        )}

        <main
          style={{
            flex: 1,
            width: "100%",
            maxWidth: 1024,
            margin: "0 auto",
            padding: "16px 12px 32px",
            boxSizing: "border-box",
            position: "relative",
            zIndex: 1,
            pointerEvents: "auto",
            overflowX: "hidden",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
