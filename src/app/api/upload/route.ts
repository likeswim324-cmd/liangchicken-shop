import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}.${ext}`
  const savePath = path.join(process.cwd(), 'public/images', filename)
  fs.writeFileSync(savePath, buffer)

  return NextResponse.json({ url: `/images/${filename}` })
}
