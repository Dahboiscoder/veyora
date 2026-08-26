"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useSocket } from "@/hooks/useSocket";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data: any;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export function useNotifications() {
  const { isAuthenticated } = useCurrentUser();
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const query = useQuery<NotificationsResponse>({
    queryKey: ["notifications"],
    queryFn: () => api.get<NotificationsResponse>("/api/notifications"),
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    const onNew = (notification: NotificationItem) => {
      queryClient.setQueryData<NotificationsResponse | undefined>(["notifications"], (prev) =>
        prev
          ? { notifications: [notification, ...prev.notifications], unreadCount: prev.unreadCount + 1 }
          : { notifications: [notification], unreadCount: 1 }
      );
    };
    socket.on("notification:new", onNew);
    return () => {
      socket.off("notification:new", onNew);
    };
  }, [socket, isAuthenticated, queryClient]);

  async function markAllRead() {
    await api.post("/api/notifications/read-all");
    queryClient.setQueryData<NotificationsResponse | undefined>(["notifications"], (prev) =>
      prev ? { notifications: prev.notifications.map((n) => ({ ...n, isRead: true })), unreadCount: 0 } : prev
    );
  }

  async function markRead(id: string) {
    await api.patch(`/api/notifications/${id}`);
    queryClient.setQueryData<NotificationsResponse | undefined>(["notifications"], (prev) =>
      prev
        ? {
            notifications: prev.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
            unreadCount: Math.max(0, prev.unreadCount - (prev.notifications.find((n) => n.id === id)?.isRead ? 0 : 1)),
          }
        : prev
    );
  }

  return {
    notifications: query.data?.notifications ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    markAllRead,
    markRead,
  };
}
