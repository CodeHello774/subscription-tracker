import { NextResponse } from 'next/server'
// 1. 改用新的 @supabase/ssr 套件
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 如果有 "next" 參數則跳轉到那裡，否則預設跳轉到 /dashboard
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    // 2. 在 Next.js 15+，cookies() 必須加上 await
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // 3. 適配新的 Cookie 讀寫方法
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
    
    // 4. 交換 Code 取得 Session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 如果驗證失敗，跳轉回登入頁或錯誤頁
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}