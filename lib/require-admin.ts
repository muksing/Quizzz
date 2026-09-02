import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Shared guard for admin-only API routes. Returns the session on success,
// or a NextResponse to return immediately on failure.
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { session: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, response: null };
}
