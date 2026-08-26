"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImageIcon, Send } from "lucide-react";
import { api } from "@/lib/api/client";
import { useSocket } from "@/hooks/useSocket";
import { initials, cn } from "@/lib/utils";
import type { ConversationSummary } from "@/hooks/useConversations";
import type { SessionUser } from "@/hooks/useCurrentUser";

interface Message {
  id: string;
  text: string | null;
  attachmentUrl: string | null;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string; avatarUrl: string | null };
}

export function MessageThread({
  conversation,
  currentUser,
  onBack,
  isOtherOnline,
}: {
  conversation: ConversationSummary;
  currentUser: SessionUser;
  onBack?: () => void;
  isOtherOnline: boolean;
}) {
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const other = conversation.otherParticipants[0];

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get<Message[]>(`/api/conversations/${conversation.id}/messages`).then((history) => {
      if (!cancelled) {
        setMessages(history);
        setLoading(false);
      }
    });

    socket.emit("conversation:join", { conversationId: conversation.id });

    const onNew = (message: Message & { conversationId: string }) => {
      if (message.conversationId !== conversation.id) return;
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    };
    socket.on("message:new", onNew);

    return () => {
      cancelled = true;
      socket.emit("conversation:leave", { conversationId: conversation.id });
      socket.off("message:new", onNew);
    };
  }, [conversation.id, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function send() {
    if (!text.trim()) return;
    if (connected) {
      socket.emit("message:send", { conversationId: conversation.id, text: text.trim() });
    } else {
      // Socket briefly disconnected — fall back to REST so the message isn't lost.
      api.post(`/api/conversations/${conversation.id}/messages`, { text: text.trim() }).then((m: any) =>
        setMessages((prev) => [...prev, m])
      );
    }
    setText("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        {onBack && (
          <button onClick={onBack} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/[0.06] md:hidden">
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="relative h-9 w-9 shrink-0">
          <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white/10 text-xs font-semibold">
            {other?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={other.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(other?.name ?? "?")
            )}
          </div>
          {isOtherOnline && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-void-950 bg-green-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {other?.name ?? "Unknown"}
            {isOtherOnline && <span className="ml-2 text-[11px] font-normal text-green-400">Online</span>}
          </p>
          {conversation.property && (
            <Link href={`/property/${conversation.property.slug}`} className="truncate text-xs text-ember-400/80 hover:underline">
              {conversation.property.title}
            </Link>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-white/30">Loading…</div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUser.id;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                    mine ? "rounded-br-sm bg-ember-500 text-white" : "rounded-bl-sm bg-white/[0.08] text-white/90"
                  )}
                >
                  {m.attachmentUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.attachmentUrl} alt="attachment" className="mb-1.5 max-h-48 rounded-lg" />
                  )}
                  {m.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-white/10 p-3">
        <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white/40 hover:bg-white/[0.06]" disabled>
          <ImageIcon className="h-4.5 w-4.5" />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message…"
          className="input flex-1"
        />
        <button onClick={send} disabled={!text.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ember-500 text-white disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
