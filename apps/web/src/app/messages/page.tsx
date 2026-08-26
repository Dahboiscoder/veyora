"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePresence } from "@/hooks/usePresence";
import { ConversationList } from "@/components/messages/ConversationList";
import { MessageThread } from "@/components/messages/MessageThread";
import { cn } from "@/lib/utils";

function MessagesPageInner() {
  const { user, isAuthenticated, isLoading: userLoading } = useCurrentUser();
  const { conversations, isLoading, refetch } = useConversations();
  const onlineUserIds = usePresence();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(searchParams.get("c"));

  useEffect(() => {
    const c = searchParams.get("c");
    if (c) setActiveId(c);
  }, [searchParams]);

  useEffect(() => {
    if (!userLoading && !isAuthenticated) router.push("/login?redirect=/messages");
  }, [userLoading, isAuthenticated, router]);

  // Refresh the list (unread counts, ordering) whenever the active thread changes.
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  return (
    <div className="mx-auto h-[calc(100svh-4rem)] max-w-6xl px-0 sm:px-6 lg:px-8">
      <div className="grid h-full grid-cols-1 overflow-hidden border-white/10 sm:my-6 sm:rounded-2xl sm:border md:grid-cols-[320px_minmax(0,1fr)]">
        <div className={cn("border-white/10 md:border-r", activeId ? "hidden md:block" : "block")}>
          <div className="border-b border-white/10 p-4">
            <h1 className="font-display text-lg font-semibold text-white">Messages</h1>
          </div>
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={(id) => setActiveId(id)}
            isLoading={isLoading}
            currentUser={user}
            onlineUserIds={onlineUserIds}
          />
        </div>

        <div className={cn(!activeId && "hidden md:block")}>
          {activeConversation && user ? (
            <MessageThread
              conversation={activeConversation}
              currentUser={user}
              onBack={() => setActiveId(null)}
              isOtherOnline={onlineUserIds.has(activeConversation.otherParticipants[0]?.id ?? "")}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-white/30">
              <MessageCircle className="mb-3 h-10 w-10" />
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesPageInner />
    </Suspense>
  );
}
