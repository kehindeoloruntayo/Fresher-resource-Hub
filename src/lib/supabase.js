


// // lib/supabase.js
// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables')
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: true
//   }
// })

// // src/lib/supabase.js
// import { createClient } from '@supabase/supabase-js'

// // Get URL and key from environment or fallback
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || window.env?.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || window.env?.VITE_SUPABASE_ANON_KEY;

// // Debug logging (remove in production)
// console.log('Supabase URL:', supabaseUrl ? 'Loaded' : 'Missing');
// console.log('Supabase Key:', supabaseAnonKey ? 'Loaded' : 'Missing');

// if (!supabaseUrl || !supabaseAnonKey) {
//   console.error('❌ Missing Supabase environment variables');
//   console.error('URL:', supabaseUrl);
//   console.error('Key:', supabaseAnonKey ? 'Present' : 'Missing');
//   throw new Error('Missing Supabase configuration');
// }

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: true
//   }
// });


// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Production values - hardcoded for now
const supabaseUrl = 'https://ehqowxfzheunjjzhapaw.supabase.co';
const supabaseAnonKey = 'sb_publishable_dgqye8n4e85Nd74gQMbhpA_qT0Cpcjs';

console.log('🔧 Supabase Configuration:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing');

// Validate
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Supabase configuration missing!');
  // Don't throw error - allow app to load with limited functionality
  // throw new Error('Missing Supabase configuration');
}

// Create client (will fail silently if missing)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});