import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-4">Subscription Tracker</h1>
      <p className="text-xl text-gray-400 mb-8">管理你的訂閱，不再花冤枉錢。</p>
      
      <div className="flex gap-4">
        <Link 
          href="/login" 
          className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          立即開始 (登入/註冊)
        </Link>
      </div>
    </div>
  )
}