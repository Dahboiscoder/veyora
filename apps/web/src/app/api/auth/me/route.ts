import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { withErrorHandling, jsonError } from "@/lib/api/response";

export const GET = withErrorHandling(async () => {
  const user = await getCurrentUser();
  if (!user) return jsonError("Not authenticated", 401);
  return NextResponse.json(user);
});
