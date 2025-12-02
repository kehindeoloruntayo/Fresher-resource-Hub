// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Explicitly define environment variables
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://ehqowxfzheunjjzhapaw.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('sb_publishable_dgqye8n4e85Nd74gQMbhpA_qT0Cpcjs'),
  },
});