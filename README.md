# 訂閱管家 (Subscription Tracker)

集中管理所有訂閱服務的支出。Netflix、Spotify、Disney+ 到 iCloud、Microsoft 365 — 一個儀表板掌握全局，自動計算每月花費、多幣別換算，並提供預算管控、試用到期提醒、取消排毒挑戰等進階工具。全端離線運作，資料存在瀏覽器 localStorage，無需註冊帳號。

![Dashboard Preview](public/screenshot.png)

## Features

### 核心功能
- **儀表板** — 每月總支出、類別佔比圓餅圖、6 個月支出預測曲線、即時匯率牌價（open.er-api.com）
- **預算管控** — 設定每月支出上限，進度條動態顯示，超支自動跳出警示
- **多幣別** — 支援 TWD / USD / JPY / KRW / CNY / EUR 即時換算
- **行事曆** — 月曆視覺化顯示所有扣款日期，一目瞭然

### 訂閱卡片
- **試用 / 優惠追蹤** — 輸入試用到期日或促銷截止日期，自動倒數計時（<3 天醒目提示、過期標紅）
- **使用頻率** — 記錄最後使用日期，超過 60 天未動用自動標示閒置
- **分攤計算** — 填入共享人名單，自動算出每人分攤金額
- **年繳節省** — 年繳方案顯示「省 X%」與月均價格
- **價格變動紀錄** — 每次編輯價格自動留存歷史，卡片上顯示上次調價資訊
- **扣款紀錄** — 可手動記錄每次扣款，查閱歷史付款明細

### 進階工具
- **年度回顧** — 一鍵檢視年支出總額、月均、類別長條圖
- **取消比較** — 列出超過 60 天未使用的訂閱，彙整每月可省金額（附咖啡杯數對照）
- **排毒挑戰** — 設定目標取消數量，儀表板顯示進度條，達標獲得榮譽獎盃
- **綑綁偵測** — 自動比對 Apple One、Microsoft 365、Google One 等組合服務，提示合併建議
- **取消引導** — 每張卡片直接連結對應平台的取消訂閱頁面

### 匯入 / 匯出
- **CSV 匯出** — 一鍵匯出報表，含多幣別換算金額
- **CSV 匯入** — 支援匯入 CSV 批次新增訂閱

### 系統
- **多主題** — 深色／淺色模式一鍵切換，設定自動保存
- **Email 通知** — 可設定扣款前提醒（需自行配置 Supabase + Resend）
- **PWA 支援** — 可安裝至手機桌面，離線瀏覽儀表板
- **全端離線** — 所有資料存在瀏覽器 localStorage，無伺服器依賴

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 + React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3.4 + CSS Variables |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | Lucide React + 27 official brand SVGs (`public/icons/`) |
| Font | Plus Jakarta Sans (next/font) |
| Storage | localStorage (無 auth、無後端) |
| PWA | Service Worker + Web Manifest |
| Exchange Rates | open.er-api.com |

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

### Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Development server (localhost:3000) |
| `npm run build` | Build + TypeScript check |
| `npm run lint` | ESLint (flat config, v9) |
| `npm start` | Production server |

## Architecture

```
├── app/
│   ├── api/send-reminders/   # Email 提醒 API（需 Supabase + Resend env）
│   ├── dashboard/             # 主儀表板
│   ├── settings/              # 設定頁
│   └── layout.tsx             # 佈局 + ThemeProvider + PWA meta
├── components/
│   ├── SubscriptionCard.tsx   # 訂閱卡片（含倒數、分攤、使用追蹤、價格歷史）
│   └── ThemeProvider.tsx      # 主題切換 Context
├── lib/
│   └── storage.ts             # localStorage 存取層（含價格歷史自動追蹤）
├── public/
│   ├── icons/                 # 29 個品牌 SVG（27 services + 2 PWA icons）
│   ├── manifest.json          # PWA 安裝資訊
│   └── sw.js                  # Service Worker
└── types/
    └── index.ts               # Subscription, BudgetSettings, DetoxChallenge, PaymentRecord
```

### Storage Layer

全部資料只存在瀏覽器的 `localStorage`，key 如下：

| Key | Content |
|-----|---------|
| `subscription_tracker_subs` | 訂閱陣列（含付款歷史、價格歷史） |
| `subscription_tracker_profile` | 使用者顯示名稱 |
| `subscription_tracker_notify` | Email 通知設定 |
| `subscription_tracker_budget` | 每月預算上限 |
| `subscription_tracker_detox` | 排毒挑戰目標與進度 |
| `subscription_tracker_theme` | 深色／淺色模式偏好 |

編輯訂閱價格時會自動在 `price_history` 留存變動紀錄；付款紀錄透過「紀錄扣款」按鈕手動新增。

## Design

Gold Glass 風格 — 深色底 `#0A0A0A`（淺色模式 `#F5F5F0`）、玻璃感卡片、主色 `#D4A574` 金屬暖金。所有色彩透過 CSS Variables 管理，滿足 WCAG AA 對比度要求。

品牌圖示均使用官方 SVG 檔案，存放於 `public/icons/`，以 `next/image` 渲染，針對深色背景手動調整暗色圖示的填色。

## License

僅供學習與作品集展示使用。
