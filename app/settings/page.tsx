"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, User, Loader2, CheckCircle, XCircle, Bell, BellOff, Mail, Sliders, Wallet, Target, TrendingDown, Trophy, RefreshCcw } from "lucide-react";
import { getProfile, saveProfile, getSubscriptions, updateSubscription } from "@/lib/storage";
import { getNotificationSettings, saveNotificationSettings, type NotificationSettings } from "@/lib/storage";
import { getBudgetSettings, saveBudgetSettings, getDetoxChallenge, saveDetoxChallenge } from "@/lib/storage";
import type { Subscription, BudgetSettings, DetoxChallenge } from "@/types";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [notif, setNotif] = useState<NotificationSettings>({ email: '', enabled: false, reminder_days: 3 });
  const [budget, setBudget] = useState<BudgetSettings>({ amount: 100, enabled: false });
  const [detox, setDetox] = useState<DetoxChallenge>({ target: 0, start_date: '', current: 0 });
  const [subs, setSubs] = useState<Subscription[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayName(getProfile().displayName || '');
      setNotif(getNotificationSettings());
      setBudget(getBudgetSettings());
      setDetox(getDetoxChallenge());
      setSubs(getSubscriptions());
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  const [saving, setSaving] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({
    show: false, type: 'success', message: ''
  });

  const router = useRouter();

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertConfig({ show: true, type, message });
  };

  const closeAlert = () => {
    setAlertConfig({ ...alertConfig, show: false });
  };

  const handleSaveName = () => {
    setSaving(true);
    saveProfile({ displayName });
    setSaving(false);
    showAlert('success', '個人資料已更新成功！');
  };

  const handleSaveNotif = () => {
    saveNotificationSettings(notif);
    showAlert('success', '通知設定已儲存！');
  };

  const handleSaveBudget = () => {
    saveBudgetSettings(budget);
    if (budget.enabled && budget.amount > 0) {
      showAlert('success', `每月預算目標已設定為 NT$ ${budget.amount}`);
    } else {
      showAlert('success', '預算目標已關閉');
    }
  };

  const handleSaveDetox = () => {
    saveDetoxChallenge(detox);
    if (detox.target > 0) {
      showAlert('success', `排毒挑戰已設定：取消 ${detox.target} 個訂閱`);
    } else {
      showAlert('success', '排毒挑戰已關閉');
    }
  };

  const toggleSubNotify = (id: string) => {
    const sub = subs.find(s => s.id === id);
    if (!sub) return;
    updateSubscription(id, { notify: !sub.notify });
    setSubs(getSubscriptions());
  };

  const activeSubs = subs;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#D4A574]/30 p-6 md:p-12 relative">

      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 回儀表板
          </button>
          <h1 className="text-2xl font-bold">設定中心</h1>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#161616] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
            <User className="text-[#D4A574]" size={20} /> 基本資料
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-2 font-medium">顯示名稱</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="例如：訂閱達人"
                className="w-full px-5 py-3 rounded-xl bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4A574] focus:ring-1 focus:ring-[#D4A574] transition-all outline-none"
              />
            </div>
            <div className="pt-2">
              <button onClick={handleSaveName} disabled={saving} className="w-full md:w-auto px-8 bg-gradient-to-r from-[#D4A574] to-[#C4956A] text-white py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(212,165,116,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> 儲存資料</>}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-[#161616] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
            <Wallet className="text-emerald-400" size={20} /> 每月預算目標
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-sm text-zinc-400 font-medium">啟用預算目標</label>
              <button
                onClick={() => setBudget({ ...budget, enabled: !budget.enabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${budget.enabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${budget.enabled ? 'translate-x-6' : ''}`} />
              </button>
            </div>
            {budget.enabled && (
              <div>
                <label className="block text-sm text-zinc-400 mb-2 font-medium">每月訂閱預算 (TWD)</label>
                <input
                  type="number"
                  value={budget.amount}
                  onChange={(e) => setBudget({ ...budget, amount: Number(e.target.value) })}
                  className="w-full px-5 py-3 rounded-xl bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4A574] transition-all outline-none"
                  placeholder="5000"
                />
                <p className="text-xs text-zinc-500 mt-2">在儀表板查看預算進度條，超支時會顯示警告。</p>
              </div>
            )}
            <div className="pt-2">
              <button onClick={handleSaveBudget} className="w-full md:w-auto px-8 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2">
                <Save size={18} /> 儲存預算設定
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#161616] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
            <Target className="text-purple-400" size={20} /> 排毒挑戰
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-2 font-medium flex items-center gap-2"><TrendingDown size={14} /> 目標取消數量</label>
              <input
                type="number"
                value={detox.target}
                onChange={(e) => setDetox({ ...detox, target: Number(e.target.value) })}
                className="w-full px-5 py-3 rounded-xl bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4A574] transition-all outline-none"
                placeholder="例如：3"
              />
              <p className="text-xs text-zinc-500 mt-2">設定您想要取消的訂閱數量，在儀表板追蹤進度。</p>
            </div>

            {detox.target > 0 && (
              <div>
                <div className="flex items-center justify-between text-sm text-zinc-400 mb-2">
                  <span>目前進度</span>
                  <span>{detox.current} / {detox.target}</span>
                </div>
                <div className="w-full bg-[#0A0A0A] rounded-full h-3 overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.round((detox.current / detox.target) * 100))}%` }}
                  />
                </div>
                {detox.current >= detox.target && detox.target > 0 && (
                  <p className="text-sm text-emerald-400 mt-3 flex items-center gap-2"><Trophy size={16} /> 挑戰達成！你做得很棒！</p>
                )}
                <button
                  onClick={() => { saveDetoxChallenge({ ...detox, current: 0 }); setDetox({ ...detox, current: 0 }); showAlert('success', '排毒進度已重置'); }}
                  className="mt-3 text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
                >
                  <RefreshCcw size={12} /> 重置進度
                </button>
              </div>
            )}

            <div className="pt-2">
              <button onClick={handleSaveDetox} className="w-full md:w-auto px-8 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2">
                <Save size={18} /> 儲存挑戰設定
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-[#161616] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4A574]/8 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
            <Bell className="text-[#D4A574]" size={20} /> Email 扣款提醒
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-2 font-medium flex items-center gap-2"><Mail size={14} /> 電子郵件</label>
              <input
                type="email"
                value={notif.email}
                onChange={(e) => setNotif({ ...notif, email: e.target.value })}
                placeholder="example@gmail.com"
                className="w-full px-5 py-3 rounded-xl bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4A574] focus:ring-1 focus:ring-[#D4A574] transition-all outline-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-zinc-400 font-medium flex items-center gap-2"><Bell size={14} /> 啟用扣款提醒</label>
              <button
                onClick={() => setNotif({ ...notif, enabled: !notif.enabled })}
                className={`relative w-12 h-6 rounded-full transition-colors ${notif.enabled ? 'bg-[#D4A574]' : 'bg-zinc-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${notif.enabled ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2 font-medium flex items-center gap-2"><Sliders size={14} /> 提前幾天提醒</label>
              <select
                value={notif.reminder_days}
                onChange={(e) => setNotif({ ...notif, reminder_days: Number(e.target.value) })}
                className="w-full px-5 py-3 rounded-xl bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4A574] transition-all outline-none appearance-none cursor-pointer"
              >
                <option value={1}>1 天前</option>
                <option value={3}>3 天前</option>
                <option value={7}>7 天前</option>
                <option value={14}>14 天前</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-3 font-medium">個別訂閱通知設定</label>
              {activeSubs.length === 0 ? (
                <p className="text-zinc-600 text-sm">尚無訂閱項目，請先到儀表板新增。</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  {activeSubs.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between bg-[#0A0A0A] rounded-xl px-4 py-3 border border-white/5">
                      <span className="text-sm text-zinc-300 truncate">{sub.name}</span>
                      <button
                        onClick={() => toggleSubNotify(sub.id)}
                        className={`transition-colors p-1.5 rounded-lg ${sub.notify ? 'text-[#D4A574] bg-[#D4A574]/10' : 'text-zinc-600 hover:text-zinc-400'}`}
                      >
                        {sub.notify ? <Bell size={16} /> : <BellOff size={16} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-zinc-600 mt-2">開啟通知的訂閱會在扣款日前收到 Email 提醒。</p>
            </div>

            <div className="pt-2">
              <button onClick={handleSaveNotif} className="w-full md:w-auto px-8 bg-gradient-to-r from-[#D4A574] to-[#C4956A] text-white py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(212,165,116,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2">
                <Save size={18} /> 儲存通知設定
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {alertConfig.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm" onClick={closeAlert}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#161616] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10 w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center mb-6">
              {alertConfig.type === 'success' ? (
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20 shadow-[0_0_20px_rgba(74,222,128,0.2)]"><CheckCircle size={40} /></div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20 shadow-[0_0_20px_rgba(248,113,113,0.2)]"><XCircle size={40} /></div>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{alertConfig.type === 'success' ? '操作成功' : '發生錯誤'}</h3>
            <p className="text-zinc-400 mb-8 leading-relaxed">{alertConfig.message}</p>
            <button onClick={closeAlert} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-zinc-700 to-zinc-800 border border-white/10 hover:border-white/20 text-white font-bold transition-all hover:shadow-lg">我知道了</button>
          </motion.div>
        </div>
      )}

    </div>
  );
}
