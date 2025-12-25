import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // console.log('[Middleware] Request:', req.nextUrl.pathname);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Prevent crash if env vars are missing
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables missing in middleware');
    return res;
  }

  // Create authenticated Supabase Client
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to login page
    if (req.nextUrl.pathname === '/admin/login') {
      return res;
    }

    if (!session) {
      // Redirect to login if not authenticated
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/admin/login';
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user is authorized admin
    // Note: We access env var from process.env which is available in middleware
    const adminEmail = process.env.ADMIN_EMAIL || 'sushilpatel7489@gmail.com';
    const userEmail = session.user.email;

    const isSuperAdmin = adminEmail && userEmail?.toLowerCase() === adminEmail?.toLowerCase();

    console.log('[Middleware] Access Check:', {
      path: req.nextUrl.pathname,
      user: userEmail,
      isSuperAdmin,
    });

    // CRITICAL FIX: Do NOT block legitimate vendors from accessing /admin
    // Only strictly block if creating a dedicated "Super Admin Only" zone in middleware,
    // otherwise let the Page/RLS handle permissions.
    // For now, we will ALLOW access if they are authenticated, but maybe redirect specific restricted pages?
    // Actually, just allowing them is safer for "Vendor Dashboard" access.

    // If you want to protect SPECIFIC super-admin pages like /admin/vendors, do it here:
    // const superAdminPaths = ['/admin/vendors'];
    // if (superAdminPaths.some(p => req.nextUrl.pathname.startsWith(p)) && !isSuperAdmin) { ... }

    if (!isSuperAdmin) {
      console.warn(`[Middleware] Non-Admin User ${userEmail} attempted to access Admin Area. BLOCKING.`);
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/admin/login';
      redirectUrl.searchParams.set('error', 'Unauthorized: You are not an administrator.');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};