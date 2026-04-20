import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'src/data/settings.json')
function read() { return JSON.parse(fs.readFileSync(dataPath, 'utf-8')) }
function write(data: unknown) { fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8') }

export async function GET() { return NextResponse.json(read()) }
export async function PUT(req: Request) {
  const body = await req.json()
  const settings = { ...read(), ...body }
  write(settings)
  return NextResponse.json(settings)
}
