"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, Save, Lock, User, Loader2, LogOut, CheckCircle, XCircle, Mail, Shield, X, ZoomIn, ZoomOut } from "lucide-react";
// 1. 引入裁切套件與工具
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/lib/canvasUtils'; 

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [savingProfile, setSavingProfile] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // --- 裁切相關狀態 ---
  const [imageSrc, setImageSrc] = useState<string | null>(null); // 原始圖片
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false); // 控制裁切視窗顯示

  const [alertConfig, setAlertConfig] = useState<{ show: boolean, type: 'success' | 'error', message: string }>({
    show: false, type: 'success', message: ''
  });

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url || "");
      }
      setLoading(false);
    };
    getProfile();
  }, [router]);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertConfig({ show: true, type, message });
  };
  const closeAlert = () => {
    setAlertConfig({ ...alertConfig, show: false });
  };

  // --- 步驟 1: 使用者選檔案，讀取並打開裁切視窗 ---
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result?.toString() || null);
        setIsCropping(true); // 打開裁切 Modal
        setZoom(1); // 重置縮放
      });
      reader.readAsDataURL(file);
    }
  };

  // --- 步驟 2: 紀錄裁切區域 ---
  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // --- 步驟 3: 確認裁切並上傳 ---
  const handleUploadCroppedImage = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      setUploading(true);

      // 取得裁切後的 Blob
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImageBlob) throw new Error("裁切失敗");

      // 準備上傳到 Supabase
      const fileName = `${user.id}/${Math.random()}.jpg`; // 隨機檔名避免快取
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedImageBlob, {
            contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      // 取得公開連結並更新畫面
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setAvatarUrl(data.publicUrl);
      
      setIsCropping(false); // 關閉視窗
      showAlert('success', '頭像更新成功！記得按儲存按鈕來綁定資料。');

    } catch (error: any) {
      console.error(error);
      showAlert('error', '上傳失敗: ' + error.message);
    } finally {
      setUploading(false);
      setImageSrc(null); // 清理
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      const updates = {
        id: user.id,
        email: user.email,
        display_name: displayName,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      showAlert('success', '個人資料已更新成功！');
    } catch (error: any) {
      showAlert('error', '儲存失敗: ' + error.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSendPasswordReset = async () => {
    try {
      setSendingReset(true);
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/update-password`, 
      });
      if (error) throw error;
      showAlert('success', `重設密碼信件已發送至 ${user.email}，請查收信箱。`);
    } catch (error: any) {
      showAlert('error', '發送失敗: ' + (error.message || "請稍後再試"));
    } finally {
      setSendingReset(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-purple-500/30 p-6 md:p-12 relative">
      
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/> 回儀表板
            </button>
            <h1 className="text-2xl font-bold">設定中心</h1>
        </div>

        {/* --- 基本資料設定 --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1e293b] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                <User className="text-purple-400" size={20} /> 基本資料
            </h2>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0 flex flex-col items-center">
                    <div className="relative group cursor-pointer w-32 h-32" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#0f172a] shadow-xl relative bg-slate-800">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500"><User size={48} /></div>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={32} />
                            </div>
                        </div>
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 opacity-50 blur group-hover:opacity-100 transition-opacity -z-10"></div>
                        {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full z-20"><Loader2 className="animate-spin text-white" /></div>}
                    </div>
                    <p className="mt-3 text-xs text-slate-400">點擊更換</p>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onSelectFile}/>
                </div>

                <div className="flex-1 w-full space-y-6">
                    <div>
                        <label className="block text-sm text-slate-400 mb-2 font-medium">顯示名稱</label>
                        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="例如：訂閱達人" className="w-full px-5 py-3 rounded-xl bg-[#0f172a] border border-slate-700 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none"/>
                    </div>
                    
                    <div className="pt-2">
                        <button onClick={handleSaveProfile} disabled={savingProfile} className="w-full md:w-auto px-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                            {savingProfile ? <Loader2 className="animate-spin" /> : <><Save size={18} /> 儲存資料</>}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* --- 帳號安全 --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1e293b] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                <Shield className="text-blue-400" size={20} /> 帳號安全
            </h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm text-slate-400 mb-2 font-medium">登入信箱 (不可修改)</label>
                    <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#0f172a]/50 border border-slate-700 text-slate-300 cursor-not-allowed">
                        <Mail size={16} className="text-slate-500"/>
                        {user?.email}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-2">
                    <button onClick={handleSendPasswordReset} disabled={sendingReset} className="flex-1 px-6 py-3 rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50">
                        {sendingReset ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />} 寄送重設密碼信件
                    </button>
                    <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }} className="flex-1 px-6 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all flex items-center justify-center gap-2 font-medium">
                        <LogOut size={18} /> 登出此帳號
                    </button>
                </div>
            </div>
        </motion.div>
      </div>

      {/* --- 裁切圖片 Modal (Crop Modal) --- */}
      <AnimatePresence>
        {isCropping && imageSrc && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[600px]">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0f172a]/50 shrink-0">
                        <h3 className="text-xl font-bold text-white">裁切頭像</h3>
                        <button onClick={() => { setIsCropping(false); setImageSrc(null); }} className="text-slate-400 hover:text-white bg-white/5 rounded-full p-2 transition-colors"><X size={24} /></button>
                    </div>
                    
                    <div className="relative flex-1 bg-black">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1} // 1:1 正方形
                            cropShape="round" // 圓形裁切
                            showGrid={false}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>

                    <div className="p-6 bg-[#1e293b] space-y-4">
                        <div className="flex items-center gap-4">
                            <ZoomOut size={20} className="text-slate-400" />
                            <input type="range" value={zoom} min={1} max={3} step={0.1} aria-labelledby="Zoom" onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                            <ZoomIn size={20} className="text-slate-400" />
                        </div>
                        <button onClick={handleUploadCroppedImage} disabled={uploading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2">
                            {uploading ? <Loader2 className="animate-spin" /> : <><CheckCircle size={18} /> 確認並上傳</>}
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* --- 自訂提示窗 (Alert Modal) --- */}
      <AnimatePresence>
        {alertConfig.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm" onClick={closeAlert}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#1e293b] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10 w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
              <div className="flex justify-center mb-6">
                {alertConfig.type === 'success' ? (
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20 shadow-[0_0_20px_rgba(74,222,128,0.2)]"><CheckCircle size={40} /></div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20 shadow-[0_0_20px_rgba(248,113,113,0.2)]"><XCircle size={40} /></div>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{alertConfig.type === 'success' ? '操作成功' : '發生錯誤'}</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">{alertConfig.message}</p>
              <button onClick={closeAlert} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 border border-white/10 hover:border-white/20 text-white font-bold transition-all hover:shadow-lg">我知道了</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}