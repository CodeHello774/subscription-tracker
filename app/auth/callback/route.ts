import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 如果有 "next" 參數則跳轉到那裡，否則預設跳轉到 /dashboard
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // --- 👇 關鍵修復：優先讀取 Cloud Run 傳來的真實網址 ---
      const forwardedHost = request.headers.get('x-forwarded-host') // Cloud Run 會有這個
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        // 本機開發時：維持使用 origin (http://localhost:3000)
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        // 雲端部署時：使用 forwardedHost (https://xxxx.run.app)
        // 注意：Cloud Run 預設是 https，所以我們強制加 https://
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        // 備案：如果都抓不到，才用 origin
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // 驗證失敗時跳轉
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}