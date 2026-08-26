"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

export interface ConversationSummary {
  id: string;
  lastMessageAt: string | null;
  property: { id: string; slug: string; title: string; media: { url: string }[] } | null;
  otherParticipants: { id: string; name: string; avatarUrl: string | null; role: string }[];
  lastMessage: { text: string | null; attachmentUrl: string | null; senderId: string; createdAt: string } | null;
  unreadCount: number;
}

export function useConversations() {
  const query = useQuery<ConversationSummary[]>({
    queryKey: ["conversations"],
    queryFn: () => api.get<ConversationSummary[]>("/api/conversations"),
    refetchInterval: 15_000,
  });
  return { conversations: query.data ?? [], isLoading: query.isLoading, refetch: query.refetch };
}
