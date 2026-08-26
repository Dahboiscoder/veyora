"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Heart, MessageCircle, Radio, CalendarClock, ShieldCheck, Info } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useCurrentUser } from "@/hooks/useCurrentUser";
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

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: userLoading } = useCurrentUser();
  const router = useRouter();
  const { notifications, unreadCount, isLoading, markAllRead, markRead } = useNotifications();

  useEffect(() => {
    if (!userLoading && !isAuthenticated) router.push("/login?redirect=/notifications");
  }, [userLoading, isAuthenticated, router]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-white">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm font-medium text-ember-400 hover:text-ember-300">
            Mark all as read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20 text-center">
          <Bell className="mb-3 h-10 w-10 text-white/20" />
          <p className="text-white/40">Nothing here yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] ?? Info;
            const href = n.data?.conversationId ? `/messages?c=${n.data.conversationId}` : n.data?.propertyId ? `/property/${n.data.propertyId}` : "#";
            return (
              <Link
                key={n.id}
                href={href}
                onClick={() => !n.isRead && markRead(n.id)}
                className={cn("glass-card flex gap-3 p-4 transition-colors hover:bg-white/[0.06]", !n.isRead && "border-ember-500/30")}
              >
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                  <Icon className="h-4.5 w-4.5 text-ember-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-sm text-white/50">{n.body}</p>}
                  <p className="mt-1 text-xs text-white/30">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ember-500" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
