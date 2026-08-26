"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Heart, History, Settings, LogOut, ShieldCheck } from "lucide-react";
import { initials, cn } from "@/lib/utils";
import { api } from "@/lib/api/client";
import type { SessionUser } from "@/hooks/useCurrentUser";

export function UserMenu({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleLogout() {
    await api.post("/api/auth/logout");
    queryClient.setQueryData(["me"], null);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const isProfessional = ["OWNER", "AGENT", "COMPANY", "ADMIN"].includes(user.role);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/[0.06] text-sm font-semibold text-white transition-transform hover:scale-105"
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          initials(user.name)
        )}
      </button>

      {open && (
        <div className="glass-card absolute right-0 top-12 w-64 overflow-hidden p-2 animate-fade-up">
          <div className="flex items-center gap-3 border-b border-white/10 px-3 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
              {initials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs text-white/50">{user.email}</p>
            </div>
          </div>
          <nav className="flex flex-col py-1.5">
            {isProfessional && (
              <Link href="/dashboard" className={itemClass} onClick={() => setOpen(false)}>
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            )}
            <Link href="/favorites" className={itemClass} onClick={() => setOpen(false)}>
              <Heart className="h-4 w-4" /> Saved properties
            </Link>
            <Link href="/recently-viewed" className={itemClass} onClick={() => setOpen(false)}>
              <History className="h-4 w-4" /> Recently viewed
            </Link>
            {user.role === "ADMIN" && (
              <Link href="/admin" className={itemClass} onClick={() => setOpen(false)}>
                <ShieldCheck className="h-4 w-4" /> Admin console
              </Link>
            )}
            <Link href="/settings" className={itemClass} onClick={() => setOpen(false)}>
              <Settings className="h-4 w-4" /> Settings
            </Link>
            <button onClick={handleLogout} className={cn(itemClass, "text-red-400 hover:text-red-300")}>
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

const itemClass =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white";
