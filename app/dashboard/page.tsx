"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar as CalendarIcon, X, Wallet, CreditCard, PieChart as PieIcon, Globe, RefreshCcw, ChevronDown, Check, Download, Search, Filter, LayoutGrid, List, Zap, Settings } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import SubscriptionCard, { POPULAR_SERVICES } from "@/components/SubscriptionCard";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Calendar from 'react-calendar';
import {
  getSubscriptions, addSubscription,
  updateSubscription, deleteSubscription,
  getProfile, getNotificationSettings,
} from "@/lib/storage";
import type { Subscription } from "@/types";

const SUPPORTED_CURRENCIES = [
  { code: 'TWD', symbol: 'NT$', flag: '🇹🇼' }, { code: 'USD', symbol: '$', flag: '🇺🇸' }, { code: 'JPY', symbol: '¥', flag: '🇯🇵' },
  { code: 'KRW', symbol: '₩', flag: '🇰🇷' }, { code: 'CNY', symbol: '¥', flag: '🇨🇳' }, { code: 'EUR', symbol: '€', flag: '🇪🇺' },
];

const COLORS = ['#D4A574', '#A3A3A3', '#E8D5B7', '#808080', '#C4956A', '#B0B0B0', '#F0E4D0', '#666666'];

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSubscriptions(getSubscriptions());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [selectedService, setSelectedService] = useState<{ name: string; color: string; icon: React.ReactNode; plans?: { name: string; price: number }[]; category: string } | null>(null);
  const [form, setForm] = useState({ name: "", price: "", billing_cycle: "monthly", start_date: "", category: "" });
  const [formLoading, setFormLoading] = useState(false);

  const [currency, setCurrency] = useState('TWD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({ 'TWD': 1 });
  const [rateLoading, setRateLoading] = useState(true);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [rightView, setRightView] = useState<'chart' | 'calendar'>('chart');

  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayName(getProfile().displayName || "");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/TWD');
        const data = await res.json();
        if (data && data.rates) setExchangeRates(data.rates);
        setRateLoading(false);
      } catch (error) { console.error("匯率失敗", error); setRateLoading(false); }
    };
    fetchRates();
  }, []);


  const getConvertedValue = useCallback((priceTWD: number) => {
    const rate = exchangeRates[currency] || 1;
    return priceTWD * rate;
  }, [currency, exchangeRates]);

  const convertPrice = useCallback((priceTWD: number) => {
    const converted = getConvertedValue(priceTWD);
    if (['JPY', 'KRW'].includes(currency)) return Math.round(converted).toLocaleString();
    return (Math.round(converted * 100) / 100).toLocaleString();
  }, [currency, getConvertedValue]);

  const currentSymbol = SUPPORTED_CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  const chartData = useMemo(() => {
    return subscriptions.reduce<{ name: string; value: number }[]>((acc, sub) => {
      const category = sub.category || "其他";
      const existing = acc.find(item => item.name === category);
      const priceTWD = Number(sub.price);
      const monthlyPriceTWD = sub.billing_cycle === 'yearly' ? Math.round(priceTWD / 12) : priceTWD;
      const finalValue = Math.round(getConvertedValue(monthlyPriceTWD));
      if (existing) existing.value += finalValue;
      else acc.push({ name: category, value: finalValue });
      return acc;
    }, []);
  }, [subscriptions, getConvertedValue]);

  const totalMonthlyCostDisplay = useMemo(() => {
    const totalTWD = subscriptions.reduce((acc, sub) => {
      const price = Number(sub.price);
      return acc + (sub.billing_cycle === 'yearly' ? Math.round(price / 12) : price);
    }, 0);
    return convertPrice(totalTWD);
  }, [subscriptions, convertPrice]);

  const mostExpensive = useMemo(() => {
    if (subscriptions.length === 0) return null;
    return subscriptions.reduce((max, sub) =>
      Number(sub.price) > Number(max.price) ? sub : max
    );
  }, [subscriptions]);

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || sub.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...Array.from(new Set(subscriptions.map(s => s.category || "其他")))];

  const calculateNextPayment = (startDate: string, cycle: string) => {
    if (!startDate) return new Date().toISOString().split('T')[0];
    const start = new Date(startDate);
    const today = new Date();
    const next = new Date(start);
    if (next > today) return next.toISOString().split('T')[0];
    while (next <= today) {
      if (cycle === 'monthly') next.setMonth(next.getMonth() + 1);
      else next.setFullYear(next.getFullYear() + 1);
    }
    return next.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    const nextDate = calculateNextPayment(form.start_date, form.billing_cycle);

    if (isEditing && editId) {
      updateSubscription(editId, { ...form, price: parseFloat(form.price), currency: 'TWD', next_payment_date: nextDate });
    } else {
      addSubscription({ ...form, price: parseFloat(form.price), currency: 'TWD', next_payment_date: nextDate });
    }

    setFormLoading(false);
    closeModal();
    setSubscriptions(getSubscriptions());
  };

  const handleDelete = (id: string) => {
    if (!confirm("確定要刪除？")) return;
    deleteSubscription(id);
    setSubscriptions(getSubscriptions());
  };

  const handleEditClick = (sub: Subscription) => {
    setIsEditing(true);
    setEditId(sub.id);
    setForm({ name: sub.name, price: sub.price.toString(), billing_cycle: sub.billing_cycle, start_date: sub.start_date, category: sub.category || "" });
    const service = POPULAR_SERVICES.find(s => s.name.toLowerCase() === sub.name.toLowerCase());
    if (service) setSelectedService(service);
    else setSelectedService(null);
    setModalOpen(true);
  };

  const handleExportCSV = () => {
    if (subscriptions.length === 0) { alert("目前沒有資料可以匯出"); return; }
    const BOM = "\uFEFF";
    const headers = ["服務名稱", `金額(${currency})`, "週期", "分類", "下次扣款日"];
    const rows = subscriptions.map(sub => {
      const priceTWD = Number(sub.price);
      const convertedPrice = getConvertedValue(priceTWD).toFixed(2);
      return [sub.name, convertedPrice, sub.billing_cycle === 'monthly' ? '月繳' : '年繳', sub.category, sub.next_payment_date];
    });
    const csvContent = BOM + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `subscriptions_${currency}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleServiceClick = (service: { name: string; color: string; icon: React.ReactNode; plans?: { name: string; price: number }[]; category: string }) => {
    if (selectedService?.name === service.name) { setSelectedService(null); }
    else { setSelectedService(service); setForm({ ...form, name: service.name, category: service.category }); }
  };

  const handlePlanSelect = (plan: { name: string; price: number }) => { setForm({ ...form, price: plan.price.toString(), billing_cycle: "monthly" }); };

  const closeModal = () => {
    setModalOpen(false); setSelectedService(null); setIsEditing(false); setEditId(null);
    setForm({ name: "", price: "", billing_cycle: "monthly", start_date: "", category: "" });
  };

  const tileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const subsOnThisDay = subscriptions.filter(sub => sub.next_payment_date === dateStr);
      if (subsOnThisDay.length > 0) {
        return (
          <div className="calendar-dot-container">
            {subsOnThisDay.map((sub, idx) => {
              const service = POPULAR_SERVICES.find(s => s.name.toLowerCase() === sub.name.toLowerCase());
              const dotColor = service ? service.color : '#D4A574';
              return <div key={idx} className="calendar-dot" style={{ backgroundColor: dotColor }}></div>
            })}
          </div>
        )
      }
    }
    return null;
  };

  const toggleNotify = (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    if (!sub) return;
    updateSubscription(id, { notify: !sub.notify });
    setSubscriptions(getSubscriptions());
  };

  useEffect(() => {
    const notif = getNotificationSettings();
    if (!notif.enabled || !notif.email) return;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + notif.reminder_days);
    const target = dueDate.toISOString().split('T')[0];
    const dueSubs = subscriptions.filter(
      s => s.next_payment_date === target && s.notify
    );
    if (dueSubs.length === 0) return;
    const sentKey = 'subscription_tracker_sent';
    const sent: string[] = JSON.parse(localStorage.getItem(sentKey) || '[]');
    const unsent = dueSubs.filter(s => !sent.includes(s.id));
    if (unsent.length === 0) return;
    fetch('/api/send-reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: notif.email, subscriptions: unsent, reminder_days: notif.reminder_days }),
    }).catch(() => {});
    const newSent = [...sent, ...unsent.map(s => s.id)];
    localStorage.setItem(sentKey, JSON.stringify(newSent));
  }, [subscriptions]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#D4A574]/30">

      <nav className="sticky top-0 z-30 backdrop-blur-xl bg-[#0A0A0A]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A574] to-[#C4956A] flex items-center justify-center shadow-lg shadow-[#D4A574]/20">
              <Wallet className="w-6 h-6 text-white" fill="currentColor" fillOpacity={0.2} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-200">訂閱管家</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)} className="flex items-center gap-2 bg-[#161616] hover:bg-[#1F1F1F] active:scale-95 transition-all rounded-full px-4 py-2 border border-white/10">
                <Globe size={14} className="text-[#D4A574]" />
                <span className="text-sm font-medium">{currency}</span>
                <ChevronDown size={12} className={`text-zinc-400 transition-transform ${currencyMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {currencyMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#161616] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <button key={c.code} onClick={() => { setCurrency(c.code); setCurrencyMenuOpen(false); }} className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-white/5 transition-colors text-left">
                      <span className="flex items-center gap-2"><span className="text-lg">{c.flag}</span><span>{c.code}</span></span>
                      {currency === c.code && <Check size={14} className="text-[#D4A574]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/settings"
              className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
              title="設定"
            >
              <Settings size={18} />
            </Link>
            {displayName && (
              <span className="text-sm text-zinc-400 hidden sm:block border-l border-white/10 pl-4 ml-2">
                {displayName}
              </span>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">

          <motion.div whileHover={{ y: -5 }} className="lg:col-span-1 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#C4956A] to-[#A3845E] p-8 shadow-2xl flex flex-col justify-between min-h-[300px] group cursor-default">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700"></div>
            <div>
              <p className="text-[#E8D5B7] font-medium mb-1 flex items-center gap-2 text-sm"><CreditCard size={16} /> 每月預估支出</p>
              <h2 className="text-4xl font-bold mb-2 text-white drop-shadow-md"><span className="text-2xl opacity-80 mr-1">{currentSymbol}</span>{totalMonthlyCostDisplay}</h2>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-xs text-[#E8D5B7] mb-1">最昂貴的訂閱</p>
              <p className="font-bold text-lg text-white truncate">{mostExpensive ? mostExpensive.name : "無"}</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="lg:col-span-2 bg-[#161616] rounded-3xl p-6 border border-white/5 shadow-xl relative overflow-hidden flex flex-col hover:border-[#D4A574]/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {rightView === 'chart' ? <PieIcon className="text-[#D4A574]" size={18} /> : <CalendarIcon className="text-[#D4A574]" size={18} />}
                <h3 className="text-base font-bold text-white">{rightView === 'chart' ? '支出分類' : '訂閱行事曆'}</h3>
              </div>
              <div className="flex bg-[#0A0A0A] rounded-lg p-1 border border-white/10">
                <button onClick={() => setRightView('chart')} className={`px-3 py-1 text-xs rounded-md transition-all ${rightView === 'chart' ? 'bg-[#D4A574] text-[#0A0A0A]' : 'text-zinc-400 hover:text-white'}`}><LayoutGrid size={14} /></button>
                <button onClick={() => setRightView('calendar')} className={`px-3 py-1 text-xs rounded-md transition-all ${rightView === 'calendar' ? 'bg-[#D4A574] text-[#0A0A0A]' : 'text-zinc-400 hover:text-white'}`}><List size={14} /></button>
              </div>
            </div>

            <div className="flex-1 w-full h-[250px] min-h-[250px] relative overflow-y-auto custom-scrollbar">
              {rightView === 'chart' ? (
                chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {chartData.map((_, index: number) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#1F1F1F', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                      <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ right: 0 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (<div className="h-full flex flex-col items-center justify-center text-zinc-500 text-sm"><p>尚無數據</p></div>)
              ) : (
                <div className="flex justify-center h-full">
                  <Calendar tileContent={tileContent} className="react-calendar" locale="zh-TW" />
                </div>
              )}
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="lg:col-span-1 bg-[#161616] rounded-3xl p-6 border border-white/5 shadow-xl flex flex-col hover:border-[#D4A574]/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><RefreshCcw className={`text-blue-400 ${rateLoading ? 'animate-spin' : ''}`} size={18} /><h3 className="text-base font-bold text-white">即時匯率</h3></div>
              <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-1 rounded">Base: TWD</span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1 mb-4">
              {['USD', 'JPY', 'EUR', 'CNY', 'KRW'].map((curr) => (
                <div key={curr} className="flex justify-between items-center p-3 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-[#D4A574]/50 transition-colors">
                  <span className="text-sm font-bold text-zinc-300">{curr}</span>
                  <span className="text-sm font-mono text-[#E8D5B7]">{exchangeRates[curr] ? (1 / exchangeRates[curr]).toFixed(3) : '-'}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-white/5 text-center">
              <p className="text-[10px] text-zinc-500">
                匯率資料來源：<a href="https://tw.rter.info/howto_currencyapi.php" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-1 hover:underline transition-colors">即匯站 RTER.info</a>
              </p>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <h3 className="text-2xl font-bold flex items-center gap-2 text-white shrink-0">訂閱列表</h3>

            <div className="relative group max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#D4A574] transition-colors" size={18} />
              <input type="text" placeholder="搜尋訂閱..." className="w-full pl-10 pr-4 py-2 bg-[#161616] border border-white/10 rounded-full text-sm text-white focus:border-[#D4A574] focus:ring-1 focus:ring-[#D4A574] transition-all outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Filter size={16} className="text-zinc-500 shrink-0" />
              {categories.map(cat => (
                <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${filterCategory === cat ? 'bg-[#D4A574] text-[#0A0A0A] border-[#D4A574]' : 'bg-[#161616] text-zinc-400 border-white/10 hover:text-white'}`}>{cat}</button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 shrink-0">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleExportCSV} className="flex items-center gap-2 bg-[#161616] border border-white/10 hover:border-[#D4A574] text-white px-4 py-3 rounded-full font-medium transition-all">
              <Download size={18} /> 匯出
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-[#D4A574] to-[#C4956A] text-white px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(212,165,116,0.3)] hover:shadow-[0_0_30px_rgba(212,165,116,0.6)] transition-all">
              <Plus size={18} /> 新增
            </motion.button>
          </div>
        </div>

        {filteredSubscriptions.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
            <p className="text-zinc-400 mb-4">{subscriptions.length === 0 ? "目前空空如也 🌑" : "找不到符合的訂閱項目 🔍"}</p>
            {subscriptions.length === 0 && <button onClick={() => setModalOpen(true)} className="text-[#D4A574] font-medium hover:text-[#E8D5B7]">新增第一筆</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredSubscriptions.map((sub, index) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  index={index}
                  currentSymbol={currentSymbol}
                  convertPrice={convertPrice}
                  onEdit={handleEditClick}
                  onDelete={handleDelete}
                  onToggleNotify={toggleNotify}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} className="bg-[#161616] border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-[#0A0A0A]/50 shrink-0">
                <h3 className="text-2xl font-bold text-white">{isEditing ? '編輯訂閱項目' : '新增訂閱項目'}</h3>
                <button onClick={closeModal} className="text-zinc-400 hover:text-white bg-white/5 rounded-full p-2 transition-colors"><X size={24} /></button>
              </div>
              <div className="flex flex-col flex-1 min-h-0">
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                  <div className="overflow-y-auto custom-scrollbar p-8 pb-4">
                    <div className="mb-6">
                      <p className="text-sm text-zinc-400 mb-4 font-medium tracking-wider uppercase">熱門服務 (點擊選擇方案)</p>
                      <div className="flex gap-6 overflow-x-auto pb-2 custom-scrollbar">
                        {POPULAR_SERVICES.map((service) => (
                          <button key={service.name} onClick={() => handleServiceClick(service)} className={`flex-shrink-0 flex flex-col items-center gap-2 group min-w-[80px] relative`}>
                            <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-zinc-400 group-hover:scale-110 transition-all shadow-lg ${selectedService?.name === service.name ? 'bg-[#D4A574]/20 border-[#D4A574] text-white' : 'bg-[#0A0A0A] border-white/10 group-hover:border-[#D4A574] group-hover:text-white'}`}>
                              {service.icon}
                            </div>
                            <span className={`text-xs transition-colors ${selectedService?.name === service.name ? 'text-[#E8D5B7] font-bold' : 'text-zinc-400 group-hover:text-white'}`}>{service.name}</span>
                            {selectedService?.name === service.name && <div className="absolute -bottom-1.5 w-1.5 h-1.5 bg-[#D4A574] rounded-full"></div>}
                          </button>
                        ))}
                      </div>
                      <AnimatePresence>
                        {selectedService && selectedService.plans && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                          >
                            <div className="bg-[#0A0A0A] rounded-2xl p-5 border border-[#D4A574]/30 mt-3">
                              <p className="text-sm text-[#E8D5B7] mb-3 font-bold flex items-center gap-2"><Zap size={16} /> 選擇 {selectedService.name} 方案</p>
                              <div className="flex flex-wrap gap-3">
                                {selectedService.plans.map((plan: { name: string; price: number }) => (
                                  <button key={plan.name} onClick={() => handlePlanSelect(plan)} className={`px-4 py-2 rounded-xl text-sm border transition-all ${form.price === plan.price.toString() ? 'bg-[#D4A574] text-[#0A0A0A] border-[#D4A574] shadow-lg shadow-[#D4A574]/20' : 'bg-[#161616] text-zinc-300 border-white/10 hover:border-[#E8D5B7]'}`}>
                                    {plan.name} <span className="opacity-70 ml-1 font-mono">${plan.price}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="space-y-5">
                      <div><label className="block text-base text-zinc-400 mb-2">服務名稱</label><input required className="w-full px-5 py-4 text-lg rounded-2xl bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4A574] focus:ring-1 focus:ring-[#D4A574] transition-all" placeholder="Netflix..." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                      <div className="grid grid-cols-2 gap-5">
                        <div><label className="block text-base text-zinc-400 mb-2">價格 (TWD)</label><input required type="number" className="w-full px-5 py-4 text-lg rounded-2xl bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4A574] focus:ring-1 focus:ring-[#D4A574] transition-all" placeholder="390" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                        <div><label className="block text-base text-zinc-400 mb-2">週期</label><select className="w-full px-5 py-4 text-lg rounded-2xl bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4A574] transition-all appearance-none cursor-pointer" value={form.billing_cycle} onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })}><option value="monthly">每月</option><option value="yearly">每年</option></select></div>
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div><label className="block text-base text-zinc-400 mb-2">開始日期</label><DatePicker selected={form.start_date ? new Date(form.start_date) : null} onChange={(date: Date | null) => setForm({ ...form, start_date: date ? date.toISOString().split('T')[0] : '' })} dateFormat="yyyy/MM/dd" placeholderText="點擊選擇日期" className="w-full px-5 py-4 text-lg rounded-2xl bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4A574] focus:ring-1 focus:ring-[#D4A574] transition-all outline-none cursor-pointer" portalId="root-portal" /></div>
                        <div><label className="block text-base text-zinc-400 mb-2">分類 (選填)</label><input className="w-full px-5 py-4 text-lg rounded-2xl bg-[#0A0A0A] border border-white/10 text-white focus:border-[#D4A574] transition-all" placeholder="娛樂..." value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 border-t border-white/10 p-8 pt-6 bg-[#161616]">
                    <button type="submit" disabled={formLoading} className="w-full bg-gradient-to-r from-[#D4A574] to-[#C4956A] text-white py-4 rounded-2xl text-lg font-bold hover:shadow-[0_0_30px_rgba(212,165,116,0.5)] active:scale-95 transition-all">{formLoading ? "儲存中..." : (isEditing ? "確認修改" : "確認新增")}</button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
