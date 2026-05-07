import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendDailySummaryEmail } from '@/lib/emails'
import { format, addDays } from 'date-fns'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if daily summary is enabled
  const { data: setting } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'daily_summary_enabled')
    .single()

  if (setting?.value !== 'true') {
    return NextResponse.json({ message: 'Daily summary disabled' })
  }

  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('date', tomorrow)
    .eq('status', 'confirmed')
    .order('time', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await sendDailySummaryEmail(tomorrow, appointments)

  return NextResponse.json({ message: 'Summary sent', date: tomorrow, count: appointments.length })
}
