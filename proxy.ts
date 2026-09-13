import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const isAdminRoute = path.startsWith('/admin');
  const isProtectedRoute = path.startsWith('/dashboard') || isAdminRoute;

  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Redirect to dashboard if logged in and trying to access auth pages
  if (token && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect to login if trying to access protected route without being logged in
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(url);
  }

  // Check permission for admin routes
  if (isAdminRoute && !token?.permissions?.includes('read:admin_panel')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // --- AUDIT: PAGE_VIEW (semua halaman, fire-and-forget) ---
  if (token?.id) {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Kirim log ke API internal (Edge tidak bisa akses Prisma langsung)
    try {
      fetch(new URL("/api/internal/audit", request.url).toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-key": process.env.NEXTAUTH_SECRET || "",
        },
        body: JSON.stringify({
          userId: token.id,
          userName: token.name || null,
          action: "PAGE_VIEW",
          target: path,
          ip,
          userAgent,
        }),
      }).catch(() => {
        // fire-and-forget: jangan blokir navigasi user
      });
    } catch {
      // Abaikan error pencatatan
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
