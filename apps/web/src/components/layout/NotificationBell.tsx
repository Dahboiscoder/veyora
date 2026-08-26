"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Heart, MessageCircle, Radio, CalendarClock, ShieldCheck, Info } from "lucide-react";
import { useNotifications, type NotificationItem } from "@/hooks/useNotifications";
import { timeAgo, cn } from "@/lib/utils";

const ICONS: Record<string, typeof Bell> = {
  MESSAGE: MessageCircle,
  FAVORITE: Heart,
  LIVE_STARTED: Radio,
  VIEWING_SCHEDULED: CalendarClock,
  VERIFICATION_UPDATE: ShieldCheck,
  NEW_PROPERTY_MATCH: Info,
  PRICE_CHANGE: Info,
  SYSTEM: Info,
};

function notificationHref(n: NotificationItem): string {
  if (n.data?.conversationId) return `/messages?c=${n.data.conversationId}`;
  if (n.data?.propertyId) return `/property/${n.data.propertyId}`;
  return "/notifications";
}

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-10 w-10 place-items-center rounded-full text-white/80 hover:bg-white/[0.06]"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-ember-500 px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="glass-card absolute right-0 top-12 w-80 overflow-hidden animate-fade-up">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-ember-400 hover:text-ember-300">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-xs text-white/40">You're all caught up.</p>
            ) : (
              notifications.slice(0, 8).map((n) => {
                const Icon = ICONS[n.type] ?? Info;
                return (
                  <Link
                    key={n.id}
                    href={notificationHref(n)}
                    onClick={() => {
                      if (!n.isRead) markRead(n.id);
                      setOpen(false);
                    }}
                    className={cn("flex gap-3 border-b border-white/5 px-4 py-3 hover:bg-white/[0.04]", !n.isRead && "bg-ember-500/[0.04]")}
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                      <Icon className="h-4 w-4 text-ember-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white/90">{n.title}</p>
                      {n.body && <p className="line-clamp-2 text-xs text-white/50">{n.body}</p>}
                      <p className="mt-0.5 text-[11px] text-white/30">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <span className="ml-auto mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ember-500" />}
                  </Link>
                );
              })
            )}
          </div>
          <Link href="/notifications" onClick={() => setOpen(false)} className="block border-t border-white/10 px-4 py-3 text-center text-xs font-medium text-white/60 hover:bg-white/[0.04]">
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
