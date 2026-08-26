import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth/session";
import { PaymentsNotConfiguredError } from "@/lib/payments/stripe";

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

/** Wraps a Route Handler body, translating known error types (Zod, AuthError, Prisma "not found") into consistent JSON error responses instead of a raw 500. */
export function withErrorHandling(
  handler: (req: Request, ctx: any) => Promise<NextResponse>
) {
  return async (req: Request, ctx: any) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof AuthError) {
        return jsonError(err.message, err.status);
      }
      if (err instanceof PaymentsNotConfiguredError) {
        return jsonError(err.message, 501);
      }
      if (err instanceof ZodError) {
        return jsonError("Validation failed", 422, err.flatten());
      }
      if (err && typeof err === "object" && "code" in err && (err as any).code === "P2025") {
        return jsonError("Resource not found", 404);
      }
      if (err && typeof err === "object" && "code" in err && (err as any).code === "P2002") {
        return jsonError("A record with these details already exists", 409);
      }
      console.error("[api] unhandled error", err);
      return jsonError("Something went wrong", 500);
    }
  };
}
