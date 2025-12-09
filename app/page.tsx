'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Zap, Shield, PieChart, Wallet } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f172a] overflow-hidden relative selection:bg-purple-500/30 text-white">
      
      {/* --- 背景動態光影 (與 Login 頁面呼應) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-4000"></div>
      </div>

      {/* --- 導覽列 --- */}
      <nav className="relative z-20 w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">訂閱管家</span>
        </div>
        <Link 
          href="/login"
          className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium backdrop-blur-md"
        >
          登入 / 註冊
        </Link>
      </nav>

      {/* --- 主要 Hero 區域 --- */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-20 pb-32 px-4 text-center max-w-5xl mx-auto">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* 小標籤 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            重新掌握你的財務自由
          </div>

          {/* 主標題 */}
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
            掌控你的 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              訂閱人生
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            別讓閒置的 Netflix、Spotify 或 AWS 訂閱悄悄偷走你的錢。<br />
            集中管理所有支出，自動計算每月開銷，讓每一分錢都花在刀口上。
          </p>
        </motion.div>

        {/* CTA 按鈕 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <Link 
            href="/login" 
            className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_50px_rgba(124,58,237,0.5)] hover:scale-105 transition-all duration-300 flex items-center gap-3 overflow-hidden"
          >
            <span className="relative z-10">立即開始使用</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
          </Link>
          
          <a href="#features" className="px-8 py-4 bg-[#1e293b] text-slate-300 border border-slate-700 font-medium rounded-full hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2">
            了解更多
          </a>
        </motion.div>

        {/* --- 特色卡片區 (Glassmorphism) --- */}
        <motion.div
          id="features"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left"
        >
          {[
            {
              icon: <PieChart className="w-6 h-6 text-purple-400" />,
              title: "視覺化儀表板",
              desc: "一眼看穿每月的固定支出，自動計算年費與月費的加總成本。"
            },
            {
              icon: <Zap className="w-6 h-6 text-blue-400" />,
              title: "自動計算週期",
              desc: "不管是月繳還是年繳，系統都會自動幫你攤提計算，精準掌握現金流。"
            },
            {
              icon: <Shield className="w-6 h-6 text-emerald-400" />,
              title: "隱私優先",
              desc: "我們只記錄您的訂閱項目，不會索取信用卡號，確保您的財務資料安全。"
            }
          ].map((item, i) => (
            <div key={i} className="group relative p-8 rounded-3xl bg-[#1e293b]/50 backdrop-blur-sm border border-white/5 hover:border-purple-500/30 hover:bg-[#1e293b] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#0f172a] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
      
      {/* 底部版權 */}
      <footer className="w-full py-8 text-center text-slate-600 text-sm relative z-10 border-t border-white/5 bg-[#0f172a]">
        <p>&copy; 2025 Subscription Tracker. Designed for Financial Freedom.</p>
      </footer>
    </div>
  )
}