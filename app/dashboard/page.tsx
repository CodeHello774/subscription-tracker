"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LogOut, Calendar as CalendarIcon, Trash2, X, Wallet, CreditCard, PieChart as PieIcon, Settings, Globe, TrendingUp, RefreshCcw, ChevronDown, Check, Download, Search, Filter, ExternalLink, LayoutGrid, List, Pencil, Zap, User } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
// 引入穩定的 react-icons
import { SiNetflix, SiSpotify, SiYoutube, SiOpenai, SiApple, SiAmazon, SiAdobe, SiDiscord, SiNordvpn, SiApplemusic } from "react-icons/si";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Calendar from 'react-calendar';

// --- 自製 SVG 圖示區 (解決外部圖片讀不到的問題) ---

const DisneyPlusIcon = ({ size = 24, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill={color} xmlns="http://www.w3.org/2000/svg"><path d="M10.957 12.893h-1.066v2.693H7.954v-2.693H6.876v-1.04h1.078V9.16h1.937v2.693h1.066v1.04zm4.708 2.616h-1.895l-1.053-2.652-.014.004-1.04 2.648H9.728l1.986-4.632-1.815-4.144h1.968l.897 2.456.014-.004.912-2.452h1.94l-3.926 8.776zm4.188-4.628h3.295v1.276h-3.295v3.296h-1.28v-3.296h-3.292v-1.276h3.292V7.585h1.28v3.296z"/></svg>
);

const GoogleOneIcon = ({ size = 24 }: { size?: number }) => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path fill="#34A853" d="M6.5 9.5l7.51-3.22-7.52-3.22 3.22 7.52 3.22 3.22-3.22 7.52-7.52-3.22 7.52-3.22-3.22-3.22z"/><path fill="#4285F4" d="M12 4v16c4.41 0 8-3.59 8-8s-3.59-8-8-8z"/><path fill="#FBBC04" d="M12 4v8.5l6-2.5-6-2.5z"/></svg>
);

const MicrosoftIcon = ({ size = 24 }: { size?: number }) => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#7FBA00" d="M13 1h10v10H13z"/><path fill="#00A4EF" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/></svg>
);

const DropboxIcon = ({ size = 24, color = "#0061FF" }: { size?: number, color?: string }) => (
    <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill={color} xmlns="http://www.w3.org/2000/svg"><path d="M6 1.807L0 6.643l6 4.836L12 6.643l6-4.836-6 4.836L6 1.807zm12 9.672l-6 4.836 6 4.836 6-4.836-6-4.836zM6 11.479L0 16.315l6 4.836 6-4.836-6-4.836zM12 17.51l-6 4.836 6 4.836 6-4.836-6-4.836z"/></svg>
);

const XboxIcon = ({ size = 24, color = "#107C10" }: { size?: number, color?: string }) => (
    <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill={color} xmlns="http://www.w3.org/2000/svg"><path d="M11.98 1.15c-6.17 0-11.16 5.1-11.16 11.41 0 3.86 1.95 7.27 4.93 9.38-.01-.22-.05-.88.13-1.29.56-1.27 3.7-4.34 3.7-4.34s-2.73 3.65-3.36 3.05c-1.28-1.21-3.53-3.43-3.53-3.43s1.94 1.07 3.92 1.25c.6.05 1.29.05 1.83-.25.37-.2.78-.62 1.17-1.27.39.65.8 1.07 1.17 1.27.54.3 1.23.3 1.83.25 1.98-.18 3.92-1.25 3.92-1.25s-2.25 2.22-3.53 3.43c-.63.6 2.1 3.05 2.1 3.05s3.14 3.07 3.7 4.34c.18.41.14 1.07.13 1.29 2.98-2.11 4.93-5.52 4.93-9.38 0-6.31-4.99-11.41-11.16-11.41"/></svg>
);

const PlayStationIcon = ({ size = 24, color = "#003791" }: { size?: number, color?: string }) => (
    <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill={color} xmlns="http://www.w3.org/2000/svg"><path d="M23.996 11.23a4.705 4.705 0 0 0-2.422-1.127l-5.632-.988a8.21 8.21 0 0 0 .152-1.579c0-2.52-1.996-3.82-3.906-3.82-.965 0-1.848.246-1.848.246l.512 2.398s.71-.168 1.199-.168c.883 0 1.27.469 1.27 1.309 0 .543-.133 1.203-.387 1.805l-4.707-.825L8.2 8.356s1.953.305 1.953 2.05c0 .356-.054.672-.125.961l-4.71 5.922s-.122-1.637.589-2.395c.571-.609 1.348-.714 1.348-.714l-.547-2.52s-2.074.207-3.21 1.418c-1.372 1.457-.966 3.996-.966 3.996s-2.46-.777-2.523-.777c-.032 0-.051.011-.059.035a.154.154 0 0 0 .043.16c.863.856 2.875 2.153 5.957 2.153 5.484 0 8.012-3.11 8.012-3.11s3.754 2.879 7.648 2.37c2.32-.3 2.508-2.612 2.508-2.612s.11.02.13-.075a.16.16 0 0 0-.083-.16l-3.32-.977c2.093-.722 3.14-1.863 3.14-2.863"/></svg>
);

const SwitchIcon = ({ size = 24, color = "#E60012" }: { size?: number, color?: string }) => (
    <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill={color} xmlns="http://www.w3.org/2000/svg"><path d="M6.35 0C2.85 0 0 2.85 0 6.35v11.3C0 21.15 2.85 24 6.35 24h3.7V0h-3.7zm1.65 4.55a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM13.95 0v24h3.7c3.5 0 6.35-2.85 6.35-6.35V6.35C24 2.85 21.15 0 17.65 0h-3.7zm2.2 16.95a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zm4.5-6.75a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zm-3.15-4.55a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zm3.15-4.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/></svg>
);

const CanvaIcon = ({ size = 24, color = "#00C4CC" }: { size?: number, color?: string }) => (
   <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill={color} xmlns="http://www.w3.org/2000/svg"><path d="M7.48 3.535c-2.316.03-3.666 1.706-3.666 3.93 0 1.956.81 2.917 2.196 2.917 1.05 0 2.374-.752 3.844-2.196-1.503-3.606-2.072-4.665-2.373-4.65zM24 10.37c-.36-.93-1.412-1.2-2.193-1.2-1.743 0-3.337 1.052-4.42 2.525.602-3.156.42-5.02-1.443-5.02-1.743 0-3.337 1.744-4.54 3.758.12-2.615-.45-4.237-2.645-4.237C5.97 6.196 3.685 9.082 1.34 14.162c-.39.842-1.323 3.397-.57 3.727.87.39 1.834-1.233 2.194-2.044.872-1.923 1.984-4.327 3.637-5.71-.54 2.224-1.232 4.93-.3 5.41.932.482 2.014-.54 2.825-1.563-.33 1.353-.6 2.435.3 2.766.72.27 1.954-.42 2.825-1.383-.39 1.503-.992 3.697-.24 4.027.69.3 2.524-1.112 3.245-2.434l-.06 2.464c.03.662 1.022.632 1.443-.09.3-.51.48-1.02.48-1.533 0-1.894-1.112-4.148-2.615-5.922 1.203-1.623 2.014-2.314 2.434-2.314.18 0 .27.06.33.15.24.45-.33 2.043-.69 2.734-.33.662-.752 1.624.15 2.013.78.33 2.553-1.532 2.943-2.344.33-.78 1.022-2.373.48-2.583zm-14.73 3.187c-1.383 1.232-2.224 1.773-2.584 1.773-.24 0-.3-.15-.24-.48.24-1.082 1.112-2.826 2.824-4.51.51-1.352 1.022-2.614 1.382-3.336 1.052-2.014 2.194-2.735 3.036-1.563.3.42.06 1.773-.51 3.426l-3.907 4.69zM15.4 12.083c-.33 1.503-1.082 3.186-2.224 4.81-1.322 1.833-2.193 2.133-2.434 2.013-.39-.18.3-2.584.812-4.147.81-2.404 1.803-4.537 2.855-5.168.42-.27.992.57 1.052.75.12.3.06 1.082-.06 1.743z"/></svg>
);

const NotionIcon = ({ size = 24, color = "currentColor" }: { size?: number, color?: string }) => (
   <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill={color} xmlns="http://www.w3.org/2000/svg"><path d="M4.459 4.208c.746.606 1.026.56 2.67.839l.067.011c1.242.235 1.144.154 1.144.57v13.085c0 .35-.205.589-.784.589-.35 0-.746-.112-1.129-.336l-.168-.103c-.615-.392-.764-.475-1.556-.252-.773.215-.81.289-.81.606 0 .391.242.849 2.051 1.025 1.836.177 3.589-.252 5.09-1.287l.037-.028c.345-.242.718-.513.718-.848V5.84l5.125 10.745v-9.67c0-.522-.167-.653-2.33-.876-.41-.037-.439-.065-.439-.42 0-.326.159-.699 1.95-.597 1.25.075 3.057.28 3.551.354.495.075.457.009.457.485v12.274c0 .41-.121.737-.624.96-.54.243-1.072.075-1.52-.373l-6.302-12.836v9.316c0 .54.196.718 2.274.96.448.056.467.075.467.439 0 .336-.187.69-1.951.588-1.557-.093-3.234-.354-3.7-.42-.467-.065-.448 0-.448-.476V5.448c0-.42.065-.634 1.157-.96 1.492-.448 3.658-.924 4.544-.28z"/></svg>
);

const XIcon = ({ size = 24, color = "currentColor" }: { size?: number, color?: string }) => (
    <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill={color} xmlns="http://www.w3.org/2000/svg"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
);

const SUPPORTED_CURRENCIES = [
    { code: 'TWD', symbol: 'NT$', flag: '🇹🇼' }, { code: 'USD', symbol: '$', flag: '🇺🇸' }, { code: 'JPY', symbol: '¥', flag: '🇯🇵' },
    { code: 'KRW', symbol: '₩', flag: '🇰🇷' }, { code: 'CNY', symbol: '¥', flag: '🇨🇳' }, { code: 'EUR', symbol: '€', flag: '🇪🇺' },
];

const POPULAR_SERVICES = [
  { name: "Netflix", icon: <SiNetflix size={24} color="#E50914"/>, category: "娛樂", color: "#E50914", cancelUrl: "https://www.netflix.com/cancelplan", plans: [{ name: "基本", price: 270 }, { name: "標準", price: 330 }, { name: "高級", price: 390 }] },
  { name: "Spotify", icon: <SiSpotify size={24} color="#1DB954"/>, category: "音樂", color: "#1DB954", cancelUrl: "https://support.spotify.com/tw/article/cancel-premium/", plans: [{ name: "個人", price: 149 }, { name: "雙人", price: 198 }, { name: "家庭", price: 268 }, { name: "學生", price: 75 }] },
  { name: "Youtube", icon: <SiYoutube size={24} color="#FF0000"/>, category: "娛樂", color: "#FF0000", cancelUrl: "https://www.youtube.com/paid_memberships", plans: [{ name: "個人", price: 199 }, { name: "家庭", price: 399 }, { name: "學生", price: 119 }] },
  { name: "Disney+", icon: <DisneyPlusIcon size={24} color="#113CCF"/>, category: "娛樂", color: "#113CCF", cancelUrl: "https://help.disneyplus.com/", plans: [{ name: "標準", price: 270 }, { name: "高級", price: 320 }] },
  { name: "Apple One", icon: <SiApple size={24} color="#FFFFFF"/>, category: "生態系", color: "#FFFFFF", cancelUrl: "https://support.apple.com/zh-tw/HT202039", plans: [{name: "個人", price: 390}, {name: "家庭", price: 490}] },
  { name: "iCloud+", icon: <SiApple size={24} color="#FFFFFF"/>, category: "雲端", color: "#FFFFFF", cancelUrl: "https://support.apple.com/zh-tw/HT207594", plans: [{name: "50GB", price: 30}, {name: "200GB", price: 90}, {name: "2TB", price: 300}] },
  { name: "Google One", icon: <GoogleOneIcon size={24}/>, category: "雲端", color: "#4285F4", cancelUrl: "https://one.google.com/settings", plans: [{name: "100GB", price: 65}, {name: "200GB", price: 90}, {name: "2TB", price: 330}] },
  { name: "Microsoft 365", icon: <MicrosoftIcon size={24}/>, category: "生產力", color: "#EA4335", cancelUrl: "https://account.microsoft.com/services", plans: [{name: "個人版", price: 219}, {name: "家用版", price: 319}] },
  { name: "Dropbox", icon: <DropboxIcon size={24}/>, category: "雲端", color: "#0061FF", cancelUrl: "https://www.dropbox.com/account/plan", plans: [{name: "Plus", price: 350}, {name: "Family", price: 550}] },
  { name: "ChatGPT", icon: <SiOpenai size={24} color="#74AA9C"/>, category: "AI", color: "#74AA9C", cancelUrl: "https://help.openai.com/en/articles/7232896-how-do-i-cancel-my-subscription", plans: [{ name: "Plus (USD)", price: 650 }, { name: "Team (USD)", price: 960 }] },
  { name: "Canva", icon: <CanvaIcon size={24}/>, category: "設計", color: "#00C4CC", cancelUrl: "https://www.canva.com/settings/billing", plans: [{ name: "Pro", price: 300 }] },
  { name: "Notion", icon: <NotionIcon size={24} color="#FFFFFF"/>, category: "生產力", color: "#FFFFFF", cancelUrl: "https://www.notion.so/settings/billing", plans: [{ name: "Plus (USD)", price: 250 }, { name: "AI Addon (USD)", price: 250 }] },
  { name: "Adobe CC", icon: <SiAdobe size={24} color="#FF0000"/>, category: "設計", color: "#FF0000", cancelUrl: "https://helpx.adobe.com/tw/manage-account/using/cancel-subscription.html", plans: [{name: "攝影計畫", price: 326}, {name: "完整全家桶", price: 1700}] },
  { name: "Xbox Game Pass", icon: <XboxIcon size={24}/>, category: "遊戲", color: "#107C10", cancelUrl: "https://account.microsoft.com/services", plans: [{name: "PC", price: 199}, {name: "Core", price: 199}, {name: "Ultimate", price: 338}] },
  { name: "PlayStation Plus", icon: <PlayStationIcon size={24}/>, category: "遊戲", color: "#003791", cancelUrl: "https://store.playstation.com/", plans: [{name: "基本", price: 198}, {name: "升級", price: 298}, {name: "高級", price: 338}] },
  { name: "Nintendo Online", icon: <SwitchIcon size={24}/>, category: "遊戲", color: "#E60012", cancelUrl: "https://ec.nintendo.com/", plans: [{name: "個人 (年)", price: 750}, {name: "家庭 (年)", price: 1300}] },
  { name: "Discord Nitro", icon: <SiDiscord size={24} color="#5865F2"/>, category: "社交", color: "#5865F2", cancelUrl: "https://support.discord.com/hc/en-us/articles/360039652152-Nitro-Billing", plans: [{name: "Basic (USD)", price: 90}, {name: "Nitro (USD)", price: 300}] },
  { name: "X Premium", icon: <XIcon size={24}/>, category: "社交", color: "#FFFFFF", cancelUrl: "https://twitter.com/settings/monetization", plans: [{name: "Basic", price: 90}, {name: "Premium", price: 240}, {name: "Premium+", price: 480}] },
  { name: "NordVPN", icon: <SiNordvpn size={24} color="#4687FF"/>, category: "工具", color: "#4687FF", cancelUrl: "https://my.nordaccount.com/billing/", plans: [{name: "Standard", price: 400}] },
  { name: "Apple Music", icon: <SiApplemusic size={24} color="#FC3C44"/>, category: "音樂", color: "#FC3C44", cancelUrl: "https://music.apple.com/account", plans: [{name: "個人", price: 165}, {name: "家庭", price: 265}] },
];

const COLORS = ['#c084fc', '#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#a78bfa', '#f87171', '#fb923c'];

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [editId, setEditId] = useState<string | null>(null); 
  
  const [selectedService, setSelectedService] = useState<any>(null); 
  const [form, setForm] = useState({ name: "", price: "", billing_cycle: "monthly", start_date: "", category: "" });
  const [formLoading, setFormLoading] = useState(false);
  
  const [currency, setCurrency] = useState('TWD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({ 'TWD': 1 });
  const [rateLoading, setRateLoading] = useState(true);
  const [currencyMenuOpen, setCurrencyMenuOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [rightView, setRightView] = useState<'chart' | 'calendar'>('chart');

  const supabase = createClient();
  const router = useRouter();

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

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile) setUserProfile(profile);
      fetchSubscriptions(user.id);
    };
    init();
  }, [router]);

  const fetchSubscriptions = async (userId: string) => {
    const { data, error } = await supabase.from("subscriptions").select("*").eq("user_id", userId).order("price", { ascending: false });
    if (data) setSubscriptions(data);
    setLoading(false);
  };

  const getConvertedValue = (priceTWD: number) => {
    const rate = exchangeRates[currency] || 1;
    return priceTWD * rate;
  };

  const convertPrice = (priceTWD: number) => {
    const converted = getConvertedValue(priceTWD);
    if (['JPY', 'KRW'].includes(currency)) return Math.round(converted).toLocaleString();
    return (Math.round(converted * 100) / 100).toLocaleString();
  };
  
  const currentSymbol = SUPPORTED_CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  const chartData = useMemo(() => {
    return subscriptions.reduce((acc: any[], sub) => {
      const category = sub.category || "其他";
      const existing = acc.find(item => item.name === category);
      const priceTWD = Number(sub.price);
      const monthlyPriceTWD = sub.billing_cycle === 'yearly' ? Math.round(priceTWD / 12) : priceTWD;
      const finalValue = Math.round(getConvertedValue(monthlyPriceTWD));

      if (existing) existing.value += finalValue;
      else acc.push({ name: category, value: finalValue });
      return acc;
    }, []);
  }, [subscriptions, currency, exchangeRates]);

  const totalMonthlyCostDisplay = useMemo(() => {
    const totalTWD = subscriptions.reduce((acc, sub) => {
        const price = Number(sub.price);
        return acc + (sub.billing_cycle === 'yearly' ? Math.round(price / 12) : price);
    }, 0);
    return convertPrice(totalTWD);
  }, [subscriptions, currency, exchangeRates]);

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
    let next = new Date(start);
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
    
    let error;
    if (isEditing && editId) {
        const { error: updateError } = await supabase.from("subscriptions").update({ ...form, price: parseFloat(form.price), next_payment_date: nextDate }).eq("id", editId);
        error = updateError;
    } else {
        const { error: insertError } = await supabase.from("subscriptions").insert([{ ...form, price: parseFloat(form.price), user_id: user.id, next_payment_date: nextDate }]);
        error = insertError;
    }

    setFormLoading(false);
    if (!error) { closeModal(); fetchSubscriptions(user.id); }
    else { alert("操作失敗: " + error.message); }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("確定要刪除？")) return;
    await supabase.from("subscriptions").delete().eq("id", id);
    fetchSubscriptions(user.id);
  }

  const handleEditClick = (sub: any) => {
      setIsEditing(true);
      setEditId(sub.id);
      setForm({ name: sub.name, price: sub.price.toString(), billing_cycle: sub.billing_cycle, start_date: sub.start_date, category: sub.category || "" });
      const service = POPULAR_SERVICES.find(s => s.name.toLowerCase() === sub.name.toLowerCase());
      if(service) setSelectedService(service);
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

  const handleServiceClick = (service: any) => {
    if (selectedService?.name === service.name) { setSelectedService(null); } 
    else { setSelectedService(service); setForm({ ...form, name: service.name, category: service.category }); }
  };

  const handlePlanSelect = (plan: any) => { setForm({ ...form, price: plan.price.toString(), billing_cycle: "monthly" }); };
  
  const closeModal = () => {
      setModalOpen(false); setSelectedService(null); setIsEditing(false); setEditId(null);
      setForm({ name: "", price: "", billing_cycle: "monthly", start_date: "", category: "" });
  };

  const getServiceIcon = (name: string) => {
    const found = POPULAR_SERVICES.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (found) return found.icon;
    return <div className="h-12 w-12 rounded-xl bg-slate-800 flex items-center justify-center text-xl font-bold text-white border border-white/10 shadow-inner group-hover:scale-110 transition-transform">{name.charAt(0).toUpperCase()}</div>;
  };

  const getCancelUrl = (name: string) => {
      const found = POPULAR_SERVICES.find(s => s.name.toLowerCase() === name.toLowerCase());
      return found?.cancelUrl || null;
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
                        const dotColor = service ? service.color : '#c084fc';
                        return <div key={idx} className="calendar-dot" style={{ backgroundColor: dotColor }}></div>
                    })}
                </div>
            )
        }
    }
    return null;
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-purple-500/30">
      
      <nav className="sticky top-0 z-30 backdrop-blur-xl bg-[#0f172a]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Wallet className="w-6 h-6 text-white" fill="currentColor" fillOpacity={0.2} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-200">訂閱管家</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
                <button onClick={() => setCurrencyMenuOpen(!currencyMenuOpen)} className="flex items-center gap-2 bg-[#1e293b] hover:bg-[#334155] active:scale-95 transition-all rounded-full px-4 py-2 border border-white/10">
                    <Globe size={14} className="text-purple-400"/>
                    <span className="text-sm font-medium">{currency}</span>
                    <ChevronDown size={12} className={`text-slate-400 transition-transform ${currencyMenuOpen ? 'rotate-180' : ''}`}/>
                </button>
                {currencyMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        {SUPPORTED_CURRENCIES.map((c) => (
                            <button key={c.code} onClick={() => { setCurrency(c.code); setCurrencyMenuOpen(false); }} className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-white/5 transition-colors text-left">
                                <span className="flex items-center gap-2"><span className="text-lg">{c.flag}</span><span>{c.code}</span></span>
                                {currency === c.code && <Check size={14} className="text-purple-400"/>}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <button onClick={() => router.push('/settings')} className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-white/5 rounded-full active:scale-90"><Settings size={20} /></button>
            <div className="flex items-center gap-2 border-l border-white/10 pl-4 ml-2">
                {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="User" className="w-8 h-8 rounded-full border border-purple-500 object-cover" />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-white/10">
                        <User size={14} className="text-slate-400" />
                    </div>
                )}
                <span className="text-sm text-slate-400 hidden sm:block">
                    {userProfile?.display_name || user?.email}
                </span>
            </div>
            <button onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }} className="p-2 text-slate-400 hover:text-red-400 transition-colors active:scale-90"><LogOut size={20} /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          
          <motion.div whileHover={{ y: -5 }} className="lg:col-span-1 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 p-8 shadow-2xl flex flex-col justify-between min-h-[300px] group cursor-default">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700"></div>
            <div>
                <p className="text-indigo-200 font-medium mb-1 flex items-center gap-2 text-sm"><CreditCard size={16}/> 每月預估支出</p>
                <h2 className="text-4xl font-bold mb-2 text-white drop-shadow-md"><span className="text-2xl opacity-80 mr-1">{currentSymbol}</span>{totalMonthlyCostDisplay}</h2>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
               <p className="text-xs text-indigo-200 mb-1">最昂貴的訂閱</p>
               <p className="font-bold text-lg text-white truncate">{subscriptions.length > 0 ? subscriptions[0].name : "無"}</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="lg:col-span-2 bg-[#1e293b] rounded-3xl p-6 border border-white/5 shadow-xl relative overflow-hidden flex flex-col hover:border-purple-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {rightView === 'chart' ? <PieIcon className="text-purple-400" size={18} /> : <CalendarIcon className="text-purple-400" size={18} />}
                    <h3 className="text-base font-bold text-white">{rightView === 'chart' ? '支出分類' : '訂閱行事曆'}</h3>
                </div>
                <div className="flex bg-[#0f172a] rounded-lg p-1 border border-white/10">
                    <button onClick={() => setRightView('chart')} className={`px-3 py-1 text-xs rounded-md transition-all ${rightView === 'chart' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}><LayoutGrid size={14}/></button>
                    <button onClick={() => setRightView('calendar')} className={`px-3 py-1 text-xs rounded-md transition-all ${rightView === 'calendar' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}><List size={14}/></button>
                </div>
            </div>

            <div className="flex-1 w-full h-[250px] min-h-[250px] relative overflow-y-auto custom-scrollbar">
                {rightView === 'chart' ? (
                    chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {chartData.map((entry: any, index: number) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ right: 0 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (<div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm"><p>尚無數據</p></div>)
                ) : (
                    <div className="flex justify-center h-full">
                        <Calendar tileContent={tileContent} className="react-calendar" locale="zh-TW" />
                    </div>
                )}
            </div>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="lg:col-span-1 bg-[#1e293b] rounded-3xl p-6 border border-white/5 shadow-xl flex flex-col hover:border-purple-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><RefreshCcw className={`text-blue-400 ${rateLoading ? 'animate-spin' : ''}`} size={18} /><h3 className="text-base font-bold text-white">即時匯率</h3></div>
                <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded">Base: TWD</span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1 mb-4">
                {['USD', 'JPY', 'EUR', 'CNY', 'KRW'].map((curr) => (
                   <div key={curr} className="flex justify-between items-center p-3 rounded-xl bg-[#0f172a] border border-white/5 hover:border-purple-500/50 transition-colors">
                       <span className="text-sm font-bold text-slate-300">{curr}</span>
                       <span className="text-sm font-mono text-purple-300">{exchangeRates[curr] ? (1 / exchangeRates[curr]).toFixed(3) : '-'}</span>
                   </div> 
                ))}
            </div>
            <div className="pt-3 border-t border-white/5 text-center">
                <p className="text-[10px] text-slate-500">
                    匯率資料來源：<a href="https://tw.rter.info/howto_currencyapi.php" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-1 hover:underline transition-colors">即匯站 RTER.info</a>
                </p>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
              <h3 className="text-2xl font-bold flex items-center gap-2 text-white shrink-0">訂閱列表</h3>
              
              <div className="relative group max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                  <input type="text" placeholder="搜尋訂閱..." className="w-full pl-10 pr-4 py-2 bg-[#1e293b] border border-white/10 rounded-full text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  <Filter size={16} className="text-slate-500 shrink-0" />
                  {categories.map(cat => (
                      <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${filterCategory === cat ? 'bg-purple-600 text-white border-purple-500' : 'bg-[#1e293b] text-slate-400 border-white/10 hover:text-white'}`}>{cat}</button>
                  ))}
              </div>
          </div>

          <div className="flex gap-3 shrink-0">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleExportCSV} className="flex items-center gap-2 bg-[#1e293b] border border-white/10 hover:border-purple-500 text-white px-4 py-3 rounded-full font-medium transition-all">
                <Download size={18} /> 匯出
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all">
                <Plus size={18} /> 新增
            </motion.button>
          </div>
        </div>

        {filteredSubscriptions.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
            <p className="text-slate-400 mb-4">{subscriptions.length === 0 ? "目前空空如也 🌑" : "找不到符合的訂閱項目 🔍"}</p>
            {subscriptions.length === 0 && <button onClick={() => setModalOpen(true)} className="text-purple-400 font-medium hover:text-purple-300">新增第一筆</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredSubscriptions.map((sub, index) => {
                const iconOrLetter = getServiceIcon(sub.name);
                const isIcon = React.isValidElement(iconOrLetter) && iconOrLetter.type !== 'div';
                const cancelUrl = getCancelUrl(sub.name);

                return (
                <motion.div key={sub.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} layout whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(168, 85, 247, 0.2)" }} className="group relative bg-[#1e293b] rounded-2xl p-6 border border-white/5 hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-5">
                        {isIcon ? (
                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                {iconOrLetter}
                            </div>
                        ) : (
                            iconOrLetter
                        )}
                        <span className="bg-purple-500/10 text-purple-300 text-xs px-3 py-1 rounded-full border border-purple-500/20">{sub.category || "訂閱"}</span>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1 truncate">{sub.name}</h4>
                    <div className="flex items-baseline gap-1 mb-4 text-slate-300">
                        <span className="text-2xl font-bold text-white">{currentSymbol} {convertPrice(sub.price)}</span>
                        <span className="text-sm text-slate-500">/ {sub.billing_cycle === 'monthly' ? '月' : '年'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500"><CalendarIcon size={14} /> <span><span className="text-purple-300">{sub.next_payment_date}</span></span></div>
                    
                    <div className="flex items-center gap-2">
                        {cancelUrl && (
                            <a href={cancelUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-yellow-400 transition-colors p-2 hover:bg-white/5 rounded-lg" title="如何取消訂閱？"><ExternalLink size={16} /></a>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleEditClick(sub); }} className="text-slate-600 hover:text-blue-400 transition-colors p-2 hover:bg-white/5 rounded-lg active:scale-90" title="編輯"><Pencil size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(sub.id); }} className="text-slate-600 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-lg active:scale-90" title="刪除"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </motion.div>
              )})} 
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Modal - 支援新增與編輯 */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} className="bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-[#0f172a]/50 shrink-0">
                <h3 className="text-2xl font-bold text-white">{isEditing ? '編輯訂閱項目' : '新增訂閱項目'}</h3>
                <button onClick={closeModal} className="text-slate-400 hover:text-white bg-white/5 rounded-full p-2 transition-colors"><X size={24} /></button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar">
                <div className="mb-8">
                  <p className="text-sm text-slate-400 mb-4 font-medium tracking-wider uppercase">熱門服務 (點擊選擇方案)</p>
                  <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
                    {POPULAR_SERVICES.map((service) => (
                      <button key={service.name} onClick={() => handleServiceClick(service)} className={`flex-shrink-0 flex flex-col items-center gap-3 group min-w-[80px] relative`}>
                        <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-slate-400 group-hover:scale-110 transition-all shadow-lg ${selectedService?.name === service.name ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-[#0f172a] border-white/10 group-hover:border-purple-500 group-hover:text-white'}`}>
                            {React.cloneElement(service.icon as any, { size: 28 })}
                        </div>
                        <span className={`text-sm transition-colors ${selectedService?.name === service.name ? 'text-purple-300 font-bold' : 'text-slate-400 group-hover:text-white'}`}>{service.name}</span>
                        {selectedService?.name === service.name && <div className="absolute -bottom-2 w-1.5 h-1.5 bg-purple-500 rounded-full"></div>}
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {selectedService && selectedService.plans && (
                        <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="overflow-hidden">
                            <div className="bg-[#0f172a] rounded-2xl p-5 border border-purple-500/30 mt-4">
                                <p className="text-sm text-purple-300 mb-3 font-bold flex items-center gap-2"><Zap size={16}/> 選擇 {selectedService.name} 方案</p>
                                <div className="flex flex-wrap gap-3">
                                    {selectedService.plans.map((plan: any) => (
                                        <button key={plan.name} onClick={() => handlePlanSelect(plan)} className={`px-4 py-2 rounded-xl text-sm border transition-all ${form.price === plan.price.toString() ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-[#1e293b] text-slate-300 border-white/10 hover:border-purple-400'}`}>
                                            {plan.name} <span className="opacity-70 ml-1 font-mono">${plan.price}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div><label className="block text-base text-slate-400 mb-2">服務名稱</label><input required className="w-full px-5 py-4 text-lg rounded-2xl bg-[#0f172a] border border-slate-700 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" placeholder="Netflix..." value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-6">
                    <div><label className="block text-base text-slate-400 mb-2">價格 (TWD)</label><input required type="number" className="w-full px-5 py-4 text-lg rounded-2xl bg-[#0f172a] border border-slate-700 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" placeholder="390" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} /></div>
                    <div><label className="block text-base text-slate-400 mb-2">週期</label><select className="w-full px-5 py-4 text-lg rounded-2xl bg-[#0f172a] border border-slate-700 text-white focus:border-purple-500 transition-all appearance-none cursor-pointer" value={form.billing_cycle} onChange={(e) => setForm({...form, billing_cycle: e.target.value})}><option value="monthly">每月</option><option value="yearly">每年</option></select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div><label className="block text-base text-slate-400 mb-2">開始日期</label><DatePicker selected={form.start_date ? new Date(form.start_date) : null} onChange={(date: Date | null) => setForm({...form, start_date: date ? date.toISOString().split('T')[0] : ''})} dateFormat="yyyy/MM/dd" placeholderText="點擊選擇日期" className="w-full px-5 py-4 text-lg rounded-2xl bg-[#0f172a] border border-slate-700 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none cursor-pointer" portalId="root-portal" /></div>
                     <div><label className="block text-base text-slate-400 mb-2">分類 (選填)</label><input className="w-full px-5 py-4 text-lg rounded-2xl bg-[#0f172a] border border-slate-700 text-white focus:border-purple-500 transition-all" placeholder="娛樂..." value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} /></div>
                  </div>
                  <div className="pt-6"><button type="submit" disabled={formLoading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl text-lg font-bold hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] active:scale-95 transition-all">{formLoading ? "儲存中..." : (isEditing ? "確認修改" : "確認新增")}</button></div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}