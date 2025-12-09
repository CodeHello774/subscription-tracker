import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  // 這裡我們加入 "||" 後面的字串作為備案
  // 當 Docker 打包時讀不到環境變數，就會使用這裡的硬編碼金鑰，讓打包順利通過
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://snwrygrhoipmqdgftqer.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNud3J5Z3Job2lwbXFkZ2Z0cWVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0OTQwNDAsImV4cCI6MjA4MDA3MDA0MH0.g0l6VJ54i6w5g1oKLNNjAtZB_6CWR32k7Q4qZOlp2KQ";

  return createBrowserClient(supabaseUrl, supabaseKey)
}