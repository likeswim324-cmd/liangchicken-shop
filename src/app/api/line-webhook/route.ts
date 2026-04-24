import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { bindLineNotifyRecipient } from '@/lib/line-notify-recipient'

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET ?? ''
const CHANNEL_ID = process.env.LINE_CHANNEL_ID ?? '1656309081'

function verifySignature(body: string, signature: string): boolean {
  if (!CHANNEL_SECRET) return false
  const hmac = crypto.createHmac('sha256', CHANNEL_SECRET)
  hmac.update(body)
  return hmac.digest('base64') === signature
}

async function getLineAccessToken(): Promise<string | null> {
  if (!CHANNEL_SECRET || !CHANNEL_ID) return null

  const res = await fetch('https://api.line.me/v2/oauth/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CHANNEL_ID,
      client_secret: CHANNEL_SECRET,
    }),
  })

  if (!res.ok) return null
  const data = (await res.json()) as { access_token?: string }
  return data.access_token ?? null
}

async function replyToLine(accessToken: string, replyToken: string, message: string) {
  await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: 'text', text: message }],
    }),
  })
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-line-signature') ?? ''

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const { events = [] } = JSON.parse(rawBody) as { events?: Array<Record<string, any>> }
    const accessToken = await getLineAccessToken()

    for (const event of events) {
      if (event.type !== 'message' || event.message?.type !== 'text' || !accessToken) continue

      const userMessage = String(event.message.text ?? '').trim()
      const replyToken = String(event.replyToken ?? '')
      const sourceUserId = event.source?.userId ? String(event.source.userId) : ''

      if (!replyToken) continue

      if (userMessage === '綁定通知' && sourceUserId) {
        await bindLineNotifyRecipient(sourceUserId)
        await replyToLine(accessToken, replyToken, '綁定成功，之後官網有新訂單時，會優先通知這個 LINE 帳號。')
      }
    }
  } catch (err) {
    console.error('LINE webhook error:', err)
  }

  return NextResponse.json({ ok: true })
}
