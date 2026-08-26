"use client";

import { MessageCircleOff } from "lucide-react";
import { timeAgo, initials, cn } from "@/lib/utils";
import type { ConversationSummary } from "@/hooks/useConversations";
import type { SessionUser } from "@/hooks/useCurrentUser";

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  isLoading,
  currentUser,
  onlineUserIds,
}: {
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  currentUser: SessionUser | null;
  onlineUserIds: Set<string>;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <MessageCircleOff className="mb-3 h-8 w-8 text-white/20" />
        <p className="text-sm text-white/40">No conversations yet. Message an agent from any property page.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {conversations.map((c) => {
        const other = c.otherParticipants[0];
        const isMe = c.lastMessage?.senderId === currentUser?.id;
        const isOnline = !!other && onlineUserIds.has(other.id);
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={cn(
              "flex items-center gap-3 border-b border-white/5 px-4 py-3 text-left transition-colors hover:bg-white/[0.04]",
              activeId === c.id && "bg-white/[0.06]"
            )}
          >
            <div className="relative h-11 w-11 shrink-0">
              <div className="h-full w-full overflow-hidden rounded-full bg-white/10 text-xs font-semibold">
                {other?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={other.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center">{initials(other?.name ?? "?")}</span>
                )}
              </div>
              {isOnline && (
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-void-950 bg-green-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-white">{other?.name ?? "Unknown"}</p>
                {c.lastMessageAt && <p className="shrink-0 text-[11px] text-white/35">{timeAgo(c.lastMessageAt)}</p>}
              </div>
              <p className="truncate text-xs text-white/45">
                {isMe && "You: "}
                {c.lastMessage?.text ?? (c.lastMessage?.attachmentUrl ? "Sent an attachment" : "No messages yet")}
              </p>
              {c.property && <p className="mt-0.5 truncate text-[11px] text-ember-400/80">{c.property.title}</p>}
            </div>
            {c.unreadCount > 0 && (
              <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-ember-500 px-1 text-[10px] font-bold text-white">
                {c.unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
