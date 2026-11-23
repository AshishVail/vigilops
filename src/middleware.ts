import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database";
import { updateSession } from "@/lib/supabase/middleware";

const protectedPrefixes = [
  "/dashboard",
  "/monitors",
  "/incidents",
  "/alerts",
  "/observatory",
  "/security",
  "/logs",
  "/ai",
  "/settings",
];

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (!isProtected) return response;

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "build-placeholder-anon-key",
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => undefined,
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon-192.png|icon-512.png|manifest.webmanifest|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
