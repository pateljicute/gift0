import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        const { error, data } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('[Auth Callback] Session exchange error:', error);
            return NextResponse.redirect(`${requestUrl.origin}/admin/login?error=${encodeURIComponent(error.message)}`);
        }

        const session = data.session;
        const userEmail = session?.user?.email;
        const adminEmail = process.env.ADMIN_EMAIL; // Ensure this env var is accessible here

        console.log('[Auth Callback] User:', userEmail);

        // Smart Redirect
        if (adminEmail && userEmail?.toLowerCase() === adminEmail.toLowerCase()) {
            return NextResponse.redirect(`${requestUrl.origin}/admin`);
        }

        // Default to home for customers
        return NextResponse.redirect(`${requestUrl.origin}`);
    } else {
        console.warn('[Auth Callback] No code provided');
        return NextResponse.redirect(`${requestUrl.origin}`);
    }
}
