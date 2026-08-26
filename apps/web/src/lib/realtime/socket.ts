"use client";

import { io, type Socket } from "socket.io-client";
import { clientEnv } from "@/lib/env.client";

let socket: Socket | null = null;

/**
 * Lazily-created singleton socket. Connects with credentials so the
 * httpOnly access-token cookie rides along in the handshake — the
 * realtime service reads it directly rather than us exposing the token
 * to client JS. Shared across every component that needs realtime
 * (messaging, live viewer counts/chat, notifications).
 */
export function getSocket(): Socket {
  if (socket) return socket;
  socket = io(clientEnv.realtimeUrl, {
    withCredentials: true,
    autoConnect: true,
    transports: ["websocket", "polling"],
  });
  return socket;
}
