import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "fariman_session";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/warehouse",
  "/coldroom",
  "/trade",
  "/suggestions",
  "/admin",
  "/people",
  "/payments",
  "/energy",
  "/payroll",
];

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) return null;
  return new TextEncoder().encode(s);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;
  const key = secret();
  if (!token || !key) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    await jwtVerify(token, key);
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/warehouse/:path*",
    "/coldroom/:path*",
    "/trade/:path*",
    "/suggestions/:path*",
    "/admin/:path*",
    "/people/:path*",
    "/payments/:path*",
    "/energy/:path*",
    "/payroll/:path*",
  ],
};
