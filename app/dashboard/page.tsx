"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    billing_cycle: "monthly",
    start_date: "",
    category: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const supabase = createClient();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  // Fetch subscriptions for this user
  const fetchSubscriptions = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false });
    if (!error) setSubscriptions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
    // eslint-disable-next-line
  }, [user]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Simple validation
    if (!form.name || !form.price || !form.billing_cycle || !form.start_date) {
      setFormError("請填寫所有必填欄位");
      return;
    }

    setFormLoading(true);
    const { error } = await supabase.from("subscriptions").insert([
      {
        name: form.name,
        price: parseFloat(form.price),
        billing_cycle: form.billing_cycle,
        start_date: form.start_date,
        category: form.category,
        user_id: user.id,
      },
    ]);
    setFormLoading(false);

    if (error) {
      setFormError(error.message);
    } else {
      setModalOpen(false);
      setForm({
        name: "",
        price: "",
        billing_cycle: "monthly",
        start_date: "",
        category: "",
      });
      fetchSubscriptions();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">尚未登入，請先登入。</p>
      </div>
    );
  }

  // --- Render
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            📊 訂閱管理儀表板
          </h1>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
          >
            登出
          </button>
        </div>

        {/* Welcome */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <p className="text-lg text-gray-700">
            👋 嗨，<span className="font-bold text-blue-600">{user.email}</span>
            ！
          </p>
          <p className="mt-2 text-gray-500">
            恭喜你！這是你的私人儀表板。
            <br />
            (目前使用 Client-side Rendering 模式)
          </p>

          {/* Add Subscription Button */}
          <div className="mt-8 mb-4 flex">
            <button
              onClick={() => setModalOpen(true)}
              className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 font-medium shadow"
            >
              ＋ 新增訂閱項目
            </button>
          </div>

          {/* Modal */}
          {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-lg">
                <button
                  className="absolute top-3 right-4 text-xl text-gray-400 hover:text-gray-600"
                  onClick={() => { setModalOpen(false); setFormError(null); }}
                  aria-label="關閉"
                >
                  ×
                </button>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  新增訂閱項目
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      名稱 <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      type="text"
                      className="w-full border px-3 py-2 rounded"
                      value={form.name}
                      onChange={handleChange}
                      required
                      disabled={formLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      價格 (NT$) <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full border px-3 py-2 rounded"
                      value={form.price}
                      onChange={handleChange}
                      required
                      disabled={formLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      計費週期 <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="billing_cycle"
                      className="w-full border px-3 py-2 rounded"
                      value={form.billing_cycle}
                      onChange={handleChange}
                      required
                      disabled={formLoading}
                    >
                      <option value="monthly">每月</option>
                      <option value="yearly">每年</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      開始日期 <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="start_date"
                      type="date"
                      className="w-full border px-3 py-2 rounded"
                      value={form.start_date}
                      onChange={handleChange}
                      required
                      disabled={formLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      分類
                    </label>
                    <input
                      name="category"
                      type="text"
                      className="w-full border px-3 py-2 rounded"
                      value={form.category}
                      onChange={handleChange}
                      placeholder="（選填）如：娛樂、生活、雲端"
                      disabled={formLoading}
                    />
                  </div>
                  {formError && (
                    <div className="text-red-500 text-sm">{formError}</div>
                  )}
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setModalOpen(false); setFormError(null); }}
                      className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-50"
                      disabled={formLoading}
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled={formLoading}
                    >
                      {formLoading ? "新增中..." : "新增"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Subscriptions List */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold mb-4">訂閱清單</h3>
            {loading ? (
              <div className="py-8 text-center text-gray-400">載入中...</div>
            ) : subscriptions.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                尚未有訂閱項目，點擊上方「新增訂閱項目」開始吧！
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="py-2 px-4 text-left text-sm font-medium text-gray-700">
                        名稱
                      </th>
                      <th className="py-2 px-4 text-right text-sm font-medium text-gray-700">
                        價格
                      </th>
                      <th className="py-2 px-4 text-center text-sm font-medium text-gray-700">
                        週期
                      </th>
                      <th className="py-2 px-4 text-center text-sm font-medium text-gray-700">
                        開始日期
                      </th>
                      <th className="py-2 px-4 text-center text-sm font-medium text-gray-700">
                        分類
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="border-b last:border-b-0">
                        <td className="py-2 px-4">{sub.name}</td>
                        <td className="py-2 px-4 text-right">NT${Number(sub.price).toLocaleString()}</td>
                        <td className="py-2 px-4 text-center">
                          {sub.billing_cycle === "monthly" ? "每月" : "每年"}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {sub.start_date ? new Date(sub.start_date).toLocaleDateString() : "-"}
                        </td>
                        <td className="py-2 px-4 text-center">
                          {sub.category || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
