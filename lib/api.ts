import { NextResponse } from "next/server";
import { getSessionFromCookie } from "@/lib/auth";

export type ApiContext = {
  userId: string;
  role: string;
};

/** Require auth — returns session or 401 response */
export async function requireAuth(): Promise<
  { session: ApiContext; error: null } | { session: null; error: NextResponse }
> {
  const session = await getSessionFromCookie();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }
  return { session, error: null };
}

/** Require admin role */
export async function requireAdmin(): Promise<
  { session: ApiContext; error: null } | { session: null; error: NextResponse }
> {
  const session = await getSessionFromCookie();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    };
  }
  if (session.role !== "admin") {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden." }, { status: 403 }),
    };
  }
  return { session, error: null };
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
