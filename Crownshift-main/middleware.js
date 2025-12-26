import { NextResponse } from 'next/server';

export function middleware(request) {
  // NOTE: This assumes you are setting a session cookie after login.
  // Adjust the cookie name or check to match your auth/session implementation.
  const sessionCookie = request.cookies.get('__session');
  const isAuthenticated = !!(sessionCookie && sessionCookie.value);

  const path = request.nextUrl.pathname;

  // List all routes that MUST require login
  const isProtectedRoute =
    path.startsWith('/quote') ||
    path.startsWith('/tracking') ||
    path.startsWith('/offers');

  if (isProtectedRoute && !isAuthenticated) {
    const callbackUrl = encodeURIComponent(path);
    const loginUrl = `/login?callbackUrl=${callbackUrl}`;
    
    // Redirect to the login page, respecting the correct host/port (localhost:3001)
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Defines which paths the middleware should run on
export const config = {
  matcher: ['/quote/:path*', '/tracking/:path*', '/offers/:path*', '/admin/:path*'],
};
