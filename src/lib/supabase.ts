export const SUPABASE_URL = process.env.SUPABASE_URL
export const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY
export const useSupabase = () => !!(SUPABASE_URL && SUPABASE_KEY)

export function sbHeaders(extra?: Record<string, string>) {
  return {
    apikey: SUPABASE_KEY!,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}
