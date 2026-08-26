"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Socket } from "socket.io-client";
import { initials, timeAgo } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export interface LiveChatMessage {
  id: string;
  text: string;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null; role: string };
}

export function LiveChat({
  streamId,
  socket,
  initialMessages,
  className,
}: {
  streamId: string;
  socket: Socket;
  initialMessages: LiveChatMessage[];
  className?: string;
}) {
  const { isAuthenticated } = useCurrentUser();
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onChat = (message: LiveChatMessage & { liveStreamId: string }) => {
      if (message.liveStreamId !== streamId) return;
      setMessages((prev) => [...prev, message]);
    };
    socket.on("live:chat:new", onChat);
    return () => {
      socket.off("live:chat:new", onChat);
    };
  }, [socket, streamId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  function send() {
    if (!isAuthenticated) return router.push("/login");
    if (!text.trim()) return;
    socket.emit("live:chat", { streamId, text: text.trim() });
    setText("");
  }

  return (
    <div className={`flex flex-col ${className ?? ""}`}>
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && <p className="text-center text-xs text-white/30">No messages yet — say hello 👋</p>}
        {messages.map((m) => (
          <div key={m.id} className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-[10px] font-semibold">
              {m.user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials(m.user.name)
              )}
            </div>
            <div className="min-w-0">
              <p className="flex items-baseline gap-1.5">
                <span className="text-xs font-semibold text-white">{m.user.name}</span>
                {["AGENT", "OWNER", "COMPANY"].includes(m.user.role) && <span className="chip !px-1.5 !py-0 text-[9px]">Host</span>}
                <span className="text-[10px] text-white/30">{timeAgo(m.createdAt)}</span>
              </p>
              <p className="break-words text-sm text-white/75">{m.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 border-t border-white/10 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={isAuthenticated ? "Ask a question…" : "Log in to chat"}
          disabled={!isAuthenticated}
          className="input flex-1"
        />
        <button onClick={send} disabled={!text.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ember-500 text-white disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
