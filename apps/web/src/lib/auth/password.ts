import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Refresh tokens are opaque JWTs handed to the client; we only ever persist
// a SHA-256 hash of them so a leaked DB dump can't be replayed as a session.
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
