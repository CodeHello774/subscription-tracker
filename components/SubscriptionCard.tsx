"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarIcon, ExternalLink, Pencil, Trash2, Bell, BellOff, Clock, Tag, Users, Gift, Zap, AlertTriangle } from "lucide-react";
import type { Subscription } from "@/types";

const img = (src: string) => <Image src={src} alt="" width={24} height={24} className="object-contain" unoptimized />;

const POPULAR_SERVICES = [
  { name: "Netflix", icon: img("/icons/netflix.svg"), category: "娛樂", color: "#E50914", cancelUrl: "https://www.netflix.com/cancelplan", plans: [{ name: "基本", price: 290 }, { name: "標準", price: 380 }, { name: "高級", price: 460 }] },
  { name: "Spotify", icon: img("/icons/spotify.svg"), category: "音樂", color: "#1DB954", cancelUrl: "https://support.spotify.com/tw/article/cancel-premium/", plans: [{ name: "個人", price: 168 }, { name: "雙人", price: 228 }, { name: "家庭", price: 298 }, { name: "學生", price: 88 }] },
  { name: "YouTube Premium", icon: img("/icons/youtube.svg"), category: "娛樂", color: "#FF0000", cancelUrl: "https://www.youtube.com/paid_memberships", plans: [{ name: "個人", price: 199 }, { name: "家庭", price: 479 }, { name: "學生", price: 119 }] },
  { name: "Disney+", icon: img("/icons/disneyplus.svg"), category: "娛樂", color: "#113CCF", cancelUrl: "https://help.disneyplus.com/cancel", plans: [{ name: "標準", price: 285 }, { name: "高級", price: 335 }] },
  { name: "HBO Max", icon: img("/icons/hbomax.svg"), category: "娛樂", color: "#7B2E8E", cancelUrl: "https://account.hbomax.com/settings", plans: [{ name: "標準", price: 2190 }, { name: "高級", price: 2990 }] },
  { name: "Amazon Prime Video", icon: img("/icons/primevideo.svg"), category: "娛樂", color: "#FF9900", cancelUrl: "https://www.amazon.com/gp/prime/pipeline/prime_purge_landing", plans: [{ name: "月繳", price: 169 }, { name: "年繳", price: 1440 }] },
  { name: "Apple One", icon: img("/icons/apple.svg"), category: "生態系", color: "#FFFFFF", cancelUrl: "https://support.apple.com/zh-tw/HT202039", plans: [{name: "個人", price: 390}, {name: "家庭", price: 490}] },
  { name: "iCloud+", icon: img("/icons/icloud.svg"), category: "雲端", color: "#FFFFFF", cancelUrl: "https://support.apple.com/zh-tw/HT207594", plans: [{name: "50GB", price: 30}, {name: "200GB", price: 90}, {name: "2TB", price: 300}] },
  { name: "Google One", icon: img("/icons/googleone.svg"), category: "雲端", color: "#4285F4", cancelUrl: "https://one.google.com/settings", plans: [{name: "100GB", price: 65}, {name: "200GB", price: 90}, {name: "2TB", price: 330}] },
  { name: "Microsoft 365", icon: img("/icons/microsoft.svg"), category: "生產力", color: "#D83B01", cancelUrl: "https://account.microsoft.com/services", plans: [{name: "個人版", price: 309}, {name: "家用版", price: 419}] },
  { name: "Dropbox", icon: img("/icons/dropbox.svg"), category: "雲端", color: "#0061FF", cancelUrl: "https://www.dropbox.com/account/plan", plans: [{name: "Plus", price: 350}, {name: "Family", price: 550}] },
  { name: "ChatGPT", icon: img("/icons/openai.svg"), category: "AI", color: "#74AA9C", cancelUrl: "https://help.openai.com/en/articles/7232896-how-do-i-cancel-my-subscription", plans: [{ name: "Plus (USD)", price: 650 }, { name: "Team (USD)", price: 960 }] },
  { name: "Canva", icon: img("/icons/canva.svg"), category: "設計", color: "#00C4CC", cancelUrl: "https://www.canva.com/settings/billing", plans: [{ name: "Pro", price: 300 }] },
  { name: "Notion", icon: img("/icons/notion.svg"), category: "生產力", color: "#FFFFFF", cancelUrl: "https://www.notion.so/settings/billing", plans: [{ name: "Plus (USD)", price: 250 }, { name: "AI Addon (USD)", price: 250 }] },
  { name: "Adobe CC", icon: img("/icons/adobe.svg"), category: "設計", color: "#FF0000", cancelUrl: "https://helpx.adobe.com/tw/manage-account/using/cancel-subscription.html", plans: [{name: "攝影計畫", price: 704}, {name: "全家桶", price: 1995}] },
  { name: "Xbox Game Pass", icon: img("/icons/xbox.svg"), category: "遊戲", color: "#107C10", cancelUrl: "https://account.microsoft.com/services", plans: [{name: "PC", price: 339}, {name: "Ultimate", price: 449}] },
  { name: "PlayStation Plus", icon: img("/icons/playstation.svg"), category: "遊戲", color: "#003791", cancelUrl: "https://store.playstation.com/", plans: [{name: "基本", price: 290}, {name: "升級", price: 430}, {name: "高級", price: 500}] },
  { name: "Nintendo Switch Online", icon: img("/icons/nintendoswitch.svg"), category: "遊戲", color: "#E60012", cancelUrl: "https://ec.nintendo.com/", plans: [{name: "個人年約", price: 599}, {name: "家庭年約", price: 1179}] },
  { name: "Discord Nitro", icon: img("/icons/discord.svg"), category: "社交", color: "#5865F2", cancelUrl: "https://support.discord.com/hc/en-us/articles/360039652152-Nitro-Billing", plans: [{name: "Basic (USD)", price: 90}, {name: "Nitro (USD)", price: 300}] },
  { name: "X Premium", icon: img("/icons/x.svg"), category: "社交", color: "#FFFFFF", cancelUrl: "https://twitter.com/settings/monetization", plans: [{name: "Basic", price: 90}, {name: "Premium", price: 240}, {name: "Premium+", price: 480}] },
  { name: "NordVPN", icon: img("/icons/nordvpn.svg"), category: "工具", color: "#4687FF", cancelUrl: "https://my.nordaccount.com/billing/", plans: [{name: "Standard", price: 400}] },
  { name: "Apple Music", icon: img("/icons/applemusic.svg"), category: "音樂", color: "#FC3C44", cancelUrl: "https://music.apple.com/account", plans: [{name: "個人", price: 165}, {name: "家庭", price: 265}] },
  { name: "LINE Premium", icon: img("/icons/line.svg"), category: "社交", color: "#06C755", cancelUrl: "https://settings.line.me/", plans: [{name: "月費", price: 165}] },
  { name: "KKBOX", icon: img("/icons/kkbox.svg"), category: "音樂", color: "#2596D1", cancelUrl: "https://account.kkbox.com/", plans: [{name: "個人", price: 159}, {name: "家庭", price: 239}] },
  { name: "Bilibili", icon: img("/icons/bilibili.svg"), category: "娛樂", color: "#00A1D6", cancelUrl: "https://www.bilibili.com/pay", plans: [{name: "大會員", price: 150}] },
  { name: "Crunchyroll", icon: img("/icons/crunchyroll.svg"), category: "娛樂", color: "#F47521", cancelUrl: "https://www.crunchyroll.com/cancel", plans: [{name: "Fan (USD)", price: 260}, {name: "Mega Fan (USD)", price: 350}] },
  { name: "Twitch", icon: img("/icons/twitch.svg"), category: "娛樂", color: "#9146FF", cancelUrl: "https://www.twitch.tv/settings/subscription", plans: [{name: "Turbo (USD)", price: 330}] },
];

function getServiceIcon(name: string) {
  const found = POPULAR_SERVICES.find(s => s.name.toLowerCase() === name.toLowerCase());
  if (found) return found.icon;
  return <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center text-xl font-bold text-white border border-white/10 shadow-inner group-hover:scale-110 transition-transform">{name.charAt(0).toUpperCase()}</div>;
}

function getCancelUrl(name: string) {
  const found = POPULAR_SERVICES.find(s => s.name.toLowerCase() === name.toLowerCase());
  return found?.cancelUrl || null;
}

export { POPULAR_SERVICES };

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function daysSince(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - target.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

interface SubscriptionCardProps {
  subscription: Subscription;
  index: number;
  currentSymbol: string;
  convertPrice: (price: number) => string;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onToggleNotify?: (id: string) => void;
}

export default function SubscriptionCard({
  subscription: sub,
  index,
  currentSymbol,
  convertPrice,
  onEdit,
  onDelete,
  onToggleNotify,
}: SubscriptionCardProps) {
  const iconOrLetter = getServiceIcon(sub.name);
  const isIcon = React.isValidElement(iconOrLetter) && iconOrLetter.type !== 'div';
  const cancelUrl = getCancelUrl(sub.name);

  const trialDaysLeft = sub.trial_end_date ? daysUntil(sub.trial_end_date) : null;
  const promoDaysLeft = sub.promo_end_date ? daysUntil(sub.promo_end_date) : null;
  const lastUsedDays = sub.last_used_date ? daysSince(sub.last_used_date) : null;

  const monthlyPrice = sub.billing_cycle === 'yearly' ? Math.round(sub.price / 12) : sub.price;
  const yearlyPrice = sub.billing_cycle === 'monthly' ? Math.round(sub.price * 12) : sub.price;
  const annualSavings = yearlyPrice - monthlyPrice * 12;
  const savingsPct = annualSavings > 0 ? Math.round((annualSavings / yearlyPrice) * 100) : 0;

  const trialExpiring = trialDaysLeft !== null && trialDaysLeft <= 3 && trialDaysLeft >= 0;
  const trialExpired = trialDaysLeft !== null && trialDaysLeft < 0;
  const promoExpiring = promoDaysLeft !== null && promoDaysLeft <= 7 && promoDaysLeft >= 0;

  const sharedCount = sub.shared_with?.length || 0;
  const costPerPerson = sharedCount > 0 ? Math.round(monthlyPrice / (sharedCount + 1)) : null;

  return (
    <motion.div
      key={sub.id}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 120, damping: 15 }}
      layout
      whileHover={{
        y: -6,
        boxShadow: "0 12px 35px -8px rgba(212, 165, 116, 0.25)",
      }}
      className="group relative bg-[#161616] rounded-2xl p-6 border border-white/5 hover:border-[#D4A574]/50 transition-all duration-300 flex flex-col justify-between"
    >
      {(trialExpiring || trialExpired) && (
        <div className={`absolute -top-2 -right-2 z-10 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 ${trialExpired ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
          <AlertTriangle size={12} />
          {trialExpired ? '試用已到期' : `試用倒數 ${trialDaysLeft} 天`}
        </div>
      )}
      {promoExpiring && !trialExpiring && (
        <div className="absolute -top-2 -right-2 z-10 px-3 py-1 rounded-full text-xs font-bold shadow-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
          <Tag size={12} />
          {`優惠 ${promoDaysLeft} 天後到期`}
        </div>
      )}

      <div>
        <div className="flex justify-between items-start mb-5">
          {isIcon ? (
            <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
              {iconOrLetter}
            </div>
          ) : (
            iconOrLetter
          )}
          <span className="bg-[#D4A574]/10 text-[#E8D5B7] text-xs px-3 py-1 rounded-full border border-[#D4A574]/20">
            {sub.category || "訂閱"}
          </span>
        </div>
        <h4 className="text-lg font-bold text-white mb-1 truncate">{sub.name}</h4>
        <div className="flex items-baseline gap-1 mb-4 text-zinc-300">
          <span className="text-2xl font-bold text-white">
            {currentSymbol} {convertPrice(sub.price)}
          </span>
          <span className="text-sm text-zinc-500">
            / {sub.billing_cycle === 'monthly' ? '月' : '年'}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          {trialDaysLeft !== null && trialDaysLeft > 0 && !trialExpiring && (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Gift size={12} className="text-emerald-400" />
              試用期剩 {trialDaysLeft} 天
            </div>
          )}
          {promoDaysLeft !== null && promoDaysLeft > 0 && !promoExpiring && (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Tag size={12} className="text-purple-400" />
              優惠價剩 {promoDaysLeft} 天
            </div>
          )}
          {sub.billing_cycle === 'yearly' && savingsPct > 0 && (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Zap size={12} />
              年繳省 {savingsPct}%（月均 {currentSymbol} {convertPrice(monthlyPrice)}）
            </div>
          )}
          {lastUsedDays !== null && (
            <div className={`flex items-center gap-2 text-xs ${lastUsedDays > 60 ? 'text-red-400' : 'text-zinc-400'}`}>
              <Clock size={12} />
              {lastUsedDays > 60 ? `${Math.floor(lastUsedDays / 30)} 個月未使用` : `${lastUsedDays} 天前使用`}
            </div>
          )}
          {sharedCount > 0 && costPerPerson !== null && (
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <Users size={12} />
              與 {sharedCount} 人分攤 — 每人 {currentSymbol} {convertPrice(costPerPerson)}/月
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-2">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <CalendarIcon size={14} />
          <span className="whitespace-nowrap">
            <span className="text-[#E8D5B7]">{sub.next_payment_date}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onToggleNotify && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleNotify(sub.id); }}
              className={`transition-colors p-2 hover:bg-white/5 rounded-lg active:scale-90 ${sub.notify ? 'text-[#D4A574] hover:text-[#E8D5B7]' : 'text-zinc-600 hover:text-[#D4A574]'}`}
              title={sub.notify ? "關閉此項通知" : "開啟此項通知"}
            >
              {sub.notify ? <Bell size={16} /> : <BellOff size={16} />}
            </button>
          )}
          {cancelUrl && (
            <a
              href={cancelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-yellow-400 transition-colors p-2 hover:bg-white/5 rounded-lg"
              title="如何取消訂閱？"
            >
              <ExternalLink size={16} />
            </a>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(sub);
            }}
            className="text-zinc-600 hover:text-blue-400 transition-colors p-2 hover:bg-white/5 rounded-lg active:scale-90"
            title="編輯"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(sub.id);
            }}
            className="text-zinc-600 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-lg active:scale-90"
            title="刪除"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
