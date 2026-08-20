import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge gate for authenticated areas.
 *
 * Route protection was previously a `useEffect` redirect inside the dashboard
 * layout, so the full dashboard shell was served to anonymous visitors and only
 * bounced after hydration. This stops the request before any of it is sent.
 *
 * This is a UX and exposure control, not the security boundary — the Laravel
 * API remains the authority on every request. It only checks that a session
 * cookie is present, never that it is valid.
 */

const SESSION_COOKIES = ["laravel_session", "bashabari_session"];

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/properties",
  "/units",
  "/tenants",
  "/leases",
  "/invoices",
  "/payments",
  "/expenses",
  "/maintenance",
  "/utilities",
  "/reports",
  "/financials",
  "/settings",
  "/building-staff",
  "/tenant-portal",
];

const AUTH_PAGES = ["/login", "/register"];

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => Boolean(request.cookies.get(name)?.value));
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = hasSessionCookie(request);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !authenticated) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    // Preserve where they were heading so login can send them back.
    login.searchParams.set("next", `${pathname}${search}`);

    return NextResponse.redirect(login);
  }

  if (AUTH_PAGES.includes(pathname) && authenticated) {
    const dashboard = request.nextUrl.clone();
    dashboard.pathname = "/dashboard";
    dashboard.search = "";

    return NextResponse.redirect(dashboard);
  }

  return NextResponse.next();
}

export const config = {
  // Everything except API proxying, Next internals and static assets.
  matcher: ["/((?!api|sanctum|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
