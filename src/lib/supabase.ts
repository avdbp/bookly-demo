import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Appointment = {
  id?: string
  client_name: string
  client_email: string
  client_phone: string
  service: string
  date: string
  time: string
  status?: string
  created_at?: string
}
