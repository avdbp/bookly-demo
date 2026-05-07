import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const settings: Record<string, string> = {}
  data.forEach((row) => { settings[row.key] = row.value })

  return NextResponse.json({ settings })
}

export async function POST(request: NextRequest) {
  const { key, value } = await request.json()

  const { error } = await supabase
    .from('settings')
    .upsert({ key, value })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
