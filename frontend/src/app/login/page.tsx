'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, ShieldAlert, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SwanLogo from '../../components/SwanLogo';

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const success = await login(loginIdentifier, password);
      if (!success) {
        setError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อระบบหลังบ้าน');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-slate-950">
      
      {/* Background Image with Dark AI Glow overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/warehouse_banner.png" 
          alt="SWAN Hub Warehouse" 
          className="w-full h-full object-cover opacity-25 mix-blend-luminosity filter blur-[1px]" 
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900/80 to-emerald-950/80" />
      </div>

      {/* Dynamic Background Circles */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-warehouse-orange/25 blur-[150px] rounded-full z-0 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/20 blur-[180px] rounded-full z-0 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <SwanLogo className="h-16 w-16 shadow-lg rounded-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-wide mt-4 font-sans uppercase">Warehouse Portal</h2>
          <p className="text-slate-400 mt-2 text-sm">ระบบบริหารพนักงานคลังสินค้า อบรมทักษะ & ความปลอดภัย</p>
        </div>

        {/* Login Frosted Card */}
        <div className="glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs flex items-center gap-2.5">
                <ShieldAlert className="shrink-0" size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Email/Employee ID Field */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-300 tracking-wider">อีเมล หรือ รหัสพนักงาน</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="employee1@warehouse.com หรือ EMP006"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-warehouse-orange transition-all focus:ring-2 focus:ring-warehouse-orange/20 placeholder:text-slate-500 text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 tracking-wider">รหัสผ่าน</label>
                <button type="button" className="text-xs text-warehouse-orange hover:underline font-semibold">ลืมรหัสผ่าน?</button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-warehouse-orange transition-all focus:ring-2 focus:ring-warehouse-orange/20 placeholder:text-slate-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={() => setRememberMe(!rememberMe)}
                  className="rounded border-slate-700 bg-slate-800 text-warehouse-orange focus:ring-warehouse-orange/30 w-4 h-4 cursor-pointer"
                />
                <span>จดจำการเข้าระบบ</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-warehouse-orange to-amber-500 text-white rounded-2xl font-semibold shadow-lg shadow-warehouse-orange/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>



        </div>
      </motion.div>
    </div>
  );
}
