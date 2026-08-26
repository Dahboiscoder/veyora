import jwt from "jsonwebtoken";
import cookie from "cookie";
import type { Socket } from "socket.io";
import { env } from "./env";

export interface AuthedUser {
  id: string;
  role: string;
  email: string;
}

/**
 * The web app stores the access token in an httpOnly cookie, so the
 * browser's socket.io-client can't read it to send as an explicit auth
 * token — instead the client connects with `withCredentials: true` and we
 * read the cookie straight off the handshake request here, verifying it
 * with the same JWT secret the Next.js app signs with.
 */
export function authenticateSocket(socket: Socket): AuthedUser | null {
  const rawCookie = socket.request.headers.cookie;
  if (!rawCookie) return null;
  const parsed = cookie.parse(rawCookie);
  const token = parsed[env.cookieName];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret) as { sub: string; role: string; email: string };
    return { id: decoded.sub, role: decoded.role, email: decoded.email };
  } catch {
    return null;
  }
}
