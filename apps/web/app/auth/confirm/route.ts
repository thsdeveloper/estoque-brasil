import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/';

  if (token_hash && type) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    });

    if (!error && data.session) {
      if (type === 'signup' || type === 'email') {
        return NextResponse.redirect(new URL('/login?verified=true', request.url));
      }
      if (type === 'recovery') {
        // For recovery, pass the tokens as query params so the reset page can use them
        const redirectUrl = new URL('/reset-password', request.url);
        redirectUrl.searchParams.set('access_token', data.session.access_token);
        redirectUrl.searchParams.set('refresh_token', data.session.refresh_token);
        return NextResponse.redirect(redirectUrl);
      }
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
}
