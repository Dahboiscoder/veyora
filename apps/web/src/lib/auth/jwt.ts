import jwt from "jsonwebtoken";
import { env } from "@/lib/env";

export interface AccessTokenPayload {
  sub: string;
  role: string;
  email: string;
}

// @types/jsonwebtoken types `expiresIn` as a template-literal union (via the
// `ms` package) rather than plain `string`, which env-sourced values can
// never statically satisfy — cast at the boundary, the runtime accepts any
// valid `ms`-style string ("15m", "30d", ...) same as documented in .env.example.
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessTtl as jwt.SignOptions["expiresIn"] });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: "refresh" }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshTtl as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { sub: string } | null {
  try {
    const decoded = jwt.verify(token, env.jwtRefreshSecret) as { sub: string; type: string };
    if (decoded.type !== "refresh") return null;
    return { sub: decoded.sub };
  } catch {
    return null;
  }
}
