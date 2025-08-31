import { createClient } from '@supabase/supabase-js'

// TODO: 실제 Supabase 프로젝트 정보로 교체 필요
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

// 환경 변수가 설정된 경우 사용
const url = process.env.REACT_APP_SUPABASE_URL || supabaseUrl
const key = process.env.REACT_APP_SUPABASE_ANON_KEY || supabaseKey

export const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})