import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { SUPABASE_URL, SUPABASE_KEY, useSupabase } from '@/lib/supabase'

const BUCKET = 'product-images'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}.${ext}`

  if (useSupabase()) {
    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: buffer,
      }
    )
    if (!uploadRes.ok) {
      const err = await uploadRes.text()
      return NextResponse.json({ error: err }, { status: 500 })
    }
    const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`
    return NextResponse.json({ url })
  }

  // 本機：寫入 public/images/
  const savePath = path.join(process.cwd(), 'public/images', filename)
  fs.writeFileSync(savePath, buffer)
  return NextResponse.json({ url: `/images/${filename}` })
}
