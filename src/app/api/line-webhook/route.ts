import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const events = body.events ?? []

    for (const event of events) {
      if (event.source?.userId) {
        console.log('FULL_LINE_USER_ID=' + event.source.userId)
        // 第一次收到後，把這個 ID 設為 LINE_OWNER_USER_ID 環境變數
      }
    }
  } catch {
    // ignore
  }
  return NextResponse.json({ ok: true })
}
