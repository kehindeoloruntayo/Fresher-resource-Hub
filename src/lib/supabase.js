// lib/supabase.js
// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = 'https://ehqowxfzheunjjzhapaw.supabase.co'
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocW93eGZ6aGV1bmpqemhhcGF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMzA2ODIsImV4cCI6MjA3ODYwNjY4Mn0.wbundeo5tpqAucwzjawKU6lMaMYuU7pemAOar4HnmGw'



// export const supabase = createClient(supabaseUrl, supabaseAnonKey)


// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)