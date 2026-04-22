import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const LINE_CHANNEL_ID = process.env.LINE_LOGIN_CHANNEL_ID!
const LINE_CHANNEL_SECRET = process.env.LINE_LOGIN_CHANNEL_SECRET!
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.liangchicken.com.tw'
const REDIRECT_URI = `${SITE_URL}/api/auth/line/callback`

function adminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${SITE_URL}/login?error=line_denied`)
  }

  // Exchange code for LINE access token
  const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: LINE_CHANNEL_ID,
      client_secret: LINE_CHANNEL_SECRET,
    }),
  })
  const tokenData = await tokenRes.json()
  if (!tokenData.access_token) {
    return NextResponse.redirect(`${SITE_URL}/login?error=line_token_failed`)
  }

  // Get LINE profile
  const profileRes = await fetch('https://api.line.me/v2/profile', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  const lineProfile = await profileRes.json()
  const lineUserId: string = lineProfile.userId
  const displayName: string = lineProfile.displayName ?? ''

  const fakeEmail = `line_${lineUserId}@line.liangchicken.local`
  const admin = adminClient()

  // Create user if not exists (ignore error if already exists)
  await admin.auth.admin.createUser({
    email: fakeEmail,
    email_confirm: true,
    user_metadata: { full_name: displayName, line_user_id: lineUserId, provider: 'line' },
  })

  // Generate one-time magic link to sign the user in
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: fakeEmail,
    options: { redirectTo: `${SITE_URL}/auth/callback` },
  })

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.redirect(`${SITE_URL}/login?error=session_failed`)
  }

  return NextResponse.redirect(linkData.properties.action_link)
}
