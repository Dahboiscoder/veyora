"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/useSocket";

/** Live online/offline presence, backed by the realtime service's in-memory
 * socket-count tracking (see apps/realtime `onlineUsers`). Fetches the
 * current snapshot on connect, then stays in sync via push events. */
export function usePresence(): Set<string> {
  const { socket, connected } = useSocket();
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!connected) return;
    socket.emit("presence:list", null, (ids: string[]) => setOnlineIds(new Set(ids)));

    const onOnline = ({ userId }: { userId: string }) =>
      setOnlineIds((prev) => new Set(prev).add(userId));
    const onOffline = ({ userId }: { userId: string }) =>
      setOnlineIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });

    socket.on("presence:online", onOnline);
    socket.on("presence:offline", onOffline);
    return () => {
      socket.off("presence:online", onOnline);
      socket.off("presence:offline", onOffline);
    };
  }, [socket, connected]);

  return onlineIds;
}
