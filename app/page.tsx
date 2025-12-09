"use client";

import Link from 'next/link'
import { motion } from 'framer-motion'
// 👇 修正：在 import 列表中補上 "Download"
import { ArrowRight, CheckCircle2, Zap, Shield, PieChart, Wallet, Calendar, Globe, Bell, Download } from 'lucide-react'

export default function Home() {
  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] overflow-hidden relative selection:bg-purple-500/30 text-white font-sans">
      
      {/* 背景動態光影 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-4000"></div>
      </div>

      {/* 導覽列 */}
      <nav className="relative z-20 w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block">訂閱管家</span>
        </div>
        <Link 
          href="/login"
          className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium backdrop-blur-md"
        >
          登入 / 註冊
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-20 pb-20 px-4 text-center max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs md:text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            重新掌握你的財務自由
          </div>

          <h1 className="text-4xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
            Subscription <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              Mastery
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            別讓閒置的 Netflix、Spotify 或 AWS 訂閱悄悄偷走你的錢。<br className="hidden md:block" />
            集中管理所有支出，自動計算每月開銷，讓每一分錢都花在刀口上。
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
          <Link href="/login" className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_50px_rgba(124,58,237,0.5)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden">
            <span className="relative z-10">立即開始使用</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
          </Link>
          
          <button onClick={scrollToFeatures} className="px-8 py-4 bg-[#1e293b] text-slate-300 border border-slate-700 font-medium rounded-full hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2">
            了解更多功能
          </button>
        </motion.div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative z-10 py-24 bg-[#0f172a]/50">
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">為什麼選擇訂閱管家？</h2>
                <p className="text-slate-400">我們提供最直覺、最強大的工具，幫您省下不必要的開銷。</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: <PieChart className="w-6 h-6 text-purple-400" />, title: "視覺化儀表板", desc: "透過甜甜圈圖與統計數據，一眼看穿每月的固定支出分佈。" },
                    { icon: <Calendar className="w-6 h-6 text-blue-400" />, title: "訂閱行事曆", desc: "直觀的月曆視圖，清楚標示每天有哪些服務即將扣款。" },
                    { icon: <Globe className="w-6 h-6 text-emerald-400" />, title: "多幣別匯率", desc: "支援 TWD, USD, JPY 等多國貨幣，即時換算總支出。" },
                    { icon: <Bell className="w-6 h-6 text-yellow-400" />, title: "自動提醒", desc: "在扣款前三天自動發送 Email 通知，給您取消的緩衝時間。" },
                    { icon: <Shield className="w-6 h-6 text-red-400" />, title: "隱私優先", desc: "我們只記錄您的訂閱項目，不會索取信用卡號，確保資料安全。" },
                    { icon: <Download className="w-6 h-6 text-cyan-400" />, title: "資料匯出", desc: "支援一鍵匯出 CSV 報表，方便您在 Excel 中進行進階記帳。" }
                ].map((item, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 20 }} 
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative p-8 rounded-3xl bg-[#1e293b]/50 backdrop-blur-sm border border-white/5 hover:border-purple-500/30 hover:bg-[#1e293b] transition-all duration-500"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-[#0f172a] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            {item.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                        <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative z-10 py-24">
         <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-12 text-center">常見問題</h2>
            <div className="space-y-6">
                {[
                    { q: "這個服務是免費的嗎？", a: "是的，目前所有功能皆完全免費且開源。" },
                    { q: "我的資料安全嗎？", a: "絕對安全。我們使用 Supabase 企業級資料庫，且不儲存您的任何支付資訊。" },
                    { q: "支援哪些訂閱服務？", a: "我們內建了 Netflix, Spotify, YouTube, ChatGPT 等熱門服務，您也可以自訂新增任何項目。" }
                ].map((faq, i) => (
                    <div key={i} className="bg-[#1e293b] rounded-2xl p-6 border border-white/5">
                        <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                        <p className="text-slate-400">{faq.a}</p>
                    </div>
                ))}
            </div>
         </div>
      </div>
      
      <footer className="w-full py-8 text-center text-slate-600 text-sm relative z-10 border-t border-white/5 bg-[#0f172a]">
        <p>© 2025 訂閱管家 Subscription Tracker. Designed for Financial Freedom.</p>
      </footer>
    </div>
  )
}