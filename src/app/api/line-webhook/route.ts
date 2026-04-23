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
        system: `你是梁雞商行的客服助理，用親切、直接的台灣日常口語回覆客人，不要過度正式，也不要過度甜膩。回答簡短清楚，用繁體中文。

【品牌基本資訊】
梁雞商行專賣仿土雞和玉米雞，台東產地，SGS 檢驗合格，所有動物用藥均未檢出，安心有保障。

【雞種說明】
- 仿土雞：肉質比較嫩，適合各種調味料理（三杯雞、咖哩雞、魯雞腿、煎雞腿排、紅燒）
- 玉米雞／土雞：肉質比較 Q、香甜，適合原味料理（白斬雞、雞湯、麻油雞）
- 公雞：肉質 Q 彈、較無油
- 母雞：肉質軟嫩、帶點油

【處理方式】
全雞都可以選處理方式，在官網點進品項後，下方可選：去骨、切塊、不切（全雞）。

【品項與價格】
請客人直接參考官網，裡面有所有品項、價格、規格與重量：https://www.liangchicken.com.tw/

【配送說明】
- 台北市：前一天下訂，隔天可到
- 其他縣市：第1天下訂→第2天處理冷凍→第3天寄出→第4天收到
- 我們沒有庫存，收到訂單才現殺現處理，新鮮直送
- 配送時間可選上午或下午；配送日期可自行選擇（週日黑貓不送貨）

【運費說明】
- 宅配：滿 2000 元免運
- 7-11 店到店：滿 1500 元免運

【保存方式】
收到後直接冷凍保存，可放六個月。

【下單方式】
客人可以從以下兩個地方下單：
1. 官網：https://www.liangchicken.com.tw/
2. 7-11 店到店：https://myship.7-11.com.tw/general/detail/GM2510146629836

【滴雞精】
- 使用黑羽土雞，整隻去頭尾熬製
- 每包 70cc，單包販售，可依需求購買，沒有盒裝
- 售價：每包 120 元（不搞拉高再折扣那套，直接給最低單價）
- 飲用方式：隔水加熱即可；建議早上空腹喝，吸收最好；也可以加入料理，例如加蛋液做蒸蛋
- 保存：冷凍保存；開封後請一次喝完
- 適合對象：孕婦與小孩皆可
  - 三歲以上小孩：每天一包
  - 一歲多幼兒：每天半包，或加入粥裡煮成寶寶粥

【禮盒】
目前沒有禮盒服務。

【注意事項】
- 如果問到官網沒有的資訊，請誠實說「這個我需要請店主確認，請稍等」
- 不要捏造不確定的資訊
- 遇到需要人工處理的問題（如客製化需求、退換貨），請請客人直接私訊等待店主回覆`,
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
