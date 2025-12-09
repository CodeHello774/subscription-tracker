"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, Wallet } from "lucide-react";
// 引入 Google 圖示
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // --- Google 登入邏輯 ---
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // 指定登入成功後要回來的網址 (就是剛剛做的 callback route)
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
        setError(error.message);
        setIsLoading(false);
    }
    // 注意：Google 登入會跳轉離開頁面，所以這裡不需要 setLoading(false)
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    let errorMsg = null;

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      errorMsg = error?.message;
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      errorMsg = error?.message;
    }

    if (errorMsg) {
      setError(errorMsg);
      setIsLoading(false);
    } else {
      if (isSignUp) alert("註冊成功！");
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f172a]">
      {/* 背景流動霓虹光 */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur opacity-75"></div>
        <div className="relative bg-[#1e293b]/90 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Wallet className="w-7 h-7 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-wide">
              {isSignUp ? "加入訂閱管家" : "歡迎回來"}
            </h2>
            <p className="text-slate-400 mt-2 text-sm">
              {isSignUp ? "開啟您的財務自由之旅" : "登入以掌控您的訂閱宇宙"}
            </p>
          </div>

          <div className="space-y-6">
            {/* Google 登入按鈕 */}
            <button
                onClick={handleGoogleLogin}
                className="w-full py-3 bg-white hover:bg-gray-50 text-slate-900 rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
                <FcGoogle size={24} />
                <span>使用 Google 帳號{isSignUp ? "註冊" : "登入"}</span>
            </button>

            {/* 分隔線 */}
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-600"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs">或者使用 Email</span>
                <div className="flex-grow border-t border-slate-600"></div>
            </div>

            {/* 原本的 Email 表單 */}
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0f172a] border border-slate-700 text-white placeholder-slate-500 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center bg-red-900/20 py-2 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    {isSignUp ? "註冊帳號" : "立即登入"}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </motion.button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {isSignUp ? "已經有帳號了？" : "還沒有帳號？"}{" "}
              <span className="text-purple-400 ml-1 hover:underline">
                {isSignUp ? "登入" : "立即註冊"}
              </span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}