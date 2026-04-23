import { NextResponse } from 'next/server'
import crypto from 'crypto'
import Anthropic from '@anthropic-ai/sdk'

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET!
const CHANNEL_ID = '1656309081'
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function verifySignature(body: string, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', CHANNEL_SECRET)
  hmac.update(body)
  return hmac.digest('base64') === signature
}

async function getLineAccessToken(): Promise<string> {
  const res = await fetch('https://api.line.me/v2/oauth/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CHANNEL_ID,
      client_secret: CHANNEL_SECRET,
    }),
  })
  const data = await res.json()
  return data.access_token
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

    const { events = [] } = JSON.parse(rawBody)

    for (const event of events) {
      if (event.type !== 'message' || event.message?.type !== 'text') continue

      const userMessage: string = event.message.text
      const replyToken: string = event.replyToken

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: `你是梁雞商行的客服助理小幫手。
梁雞商行專賣溫體土雞、玉米雞，當日現宰、當日宅配到府。
回答要簡短友善，用繁體中文。
如果客人問到訂購，請告訴他們可以透過 LINE 下單或直接私訊。
常見問題：
- 土雞 vs 玉米雞：土雞肉質扎實有嚼勁，玉米雞肉質軟嫩；
- 配送範圍：北北基桃當日配送，全台冷鏈宅配；
- 訂購截止：當天上午訂，當天送。`,
        messages: [{ role: 'user', content: userMessage }],
      })

      const aiReply =
        response.content[0].type === 'text'
          ? response.content[0].text
          : '抱歉，我暫時無法回覆，請稍後再試。'

      const accessToken = await getLineAccessToken()
      await replyToLine(accessToken, replyToken, aiReply)
    }
  } catch (err) {
    console.error('LINE webhook error:', err)
  }

  return NextResponse.json({ ok: true })
}
