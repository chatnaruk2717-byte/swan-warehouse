'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../../components/GlassCard';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Lock, 
  Camera, 
  Save, 
  ShieldCheck, 
  Key 
} from 'lucide-react';

export default function ProfilePage() {
  const { user, api, updateProfile } = useAuth();
  
  // Profile details form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    photo_url: ''
  });

  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        photo_url: user.photo_url || ''
      });
    }
  }, [user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({
          ...prev,
          photo_url: reader.result as string // Base64 data URL
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.put('/api/auth/profile/update', profileForm);
      updateProfile(res.data);
      alert('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว');
    } catch (err: any) {
      // Mock mode update
      if (user) {
        const updatedUser = {
          ...user,
          ...profileForm
        };
        updateProfile(updatedUser);
        alert('บันทึกข้อมูลส่วนตัวสำเร็จ (Mock Mode)');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('รหัสผ่านใหม่ไม่ตรงกัน');
      return;
    }

    setPasswordLoading(true);

    try {
      await api.post('/api/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      alert('เปลี่ยนรหัสผ่านสำเร็จแล้ว');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      alert(err.response?.data?.message || 'การเปลี่ยนรหัสผ่านผิดพลาด (หรือรหัสผ่านปัจจุบันไม่ถูกต้อง)');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[400px]">
        <p className="text-slate-400 text-xs">กรุณาเข้าสู่ระบบก่อนจัดการโปรไฟล์</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header Info */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">ตั้งค่าโปรไฟล์ส่วนตัว (Profile Settings)</h2>
        <p className="text-slate-400 text-sm mt-1">อัปเดตข้อมูลการติดต่อ อัปโหลดรูปประจำตัว และแก้ไขรหัสผ่านผู้เข้าใช้งานระบบ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar Display and Role Details */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="text-center py-8 space-y-6 border border-slate-200/50 dark:border-white/5 relative overflow-hidden">
            
            {/* Background glass effect */}
            <div className="absolute inset-0 bg-warehouse-orange/5 dark:bg-warehouse-orange/5 blur-3xl rounded-full -z-10" />

            <div className="relative w-28 h-28 mx-auto group">
              {profileForm.photo_url ? (
                <img src={profileForm.photo_url} alt="Profile" className="w-full h-full rounded-3xl object-cover ring-4 ring-warehouse-orange/20 shadow-md" />
              ) : (
                <div className="w-full h-full rounded-3xl bg-warehouse-orange/20 text-warehouse-orange flex items-center justify-center font-bold text-3xl shadow-inner">
                  {user.name[0]}
                </div>
              )}
              
              {/* Photo selector hover overlay */}
              <label 
                htmlFor="profile-photo-picker" 
                className="absolute inset-0 bg-black/50 hover:bg-black/60 rounded-3xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera size={20} />
              </label>
              <input 
                type="file" 
                accept="image/*" 
                id="profile-photo-picker" 
                onChange={handlePhotoUpload} 
                className="hidden" 
              />
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white">{user.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{user.position} • {user.department}</p>
              
              <span className="inline-block mt-3 px-3 py-1 bg-warehouse-orange/10 text-warehouse-orange rounded-full text-[10px] font-bold tracking-wider uppercase border border-warehouse-orange/20">
                สิทธิ์: {user.role.replace('_', ' ')}
              </span>
            </div>

            <div className="text-[10px] text-slate-400 font-mono border-t border-slate-100 dark:border-white/5 pt-4">
              รหัสพนักงาน: {user.employee_id}
            </div>
          </GlassCard>
        </div>

        {/* Right Side: Edit Form and Password form */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Edit details form */}
          <GlassCard className="border border-slate-200/50 dark:border-white/5" delay={0.05}>
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200/50 dark:border-white/5">
              <UserIcon className="text-warehouse-orange" size={18} />
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">ข้อมูลส่วนตัวทั่วไป (Personal Details)</h4>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">ชื่อ-นามสกุลจริง</label>
                  <input 
                    type="text" 
                    required 
                    value={profileForm.name} 
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} 
                    className="glass-input text-xs" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">อีเมลลงทะเบียน</label>
                  <input 
                    type="email" 
                    required 
                    value={profileForm.email} 
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} 
                    className="glass-input text-xs" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">เบอร์โทรศัพท์มือถือ</label>
                  <input 
                    type="text" 
                    value={profileForm.phone} 
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} 
                    className="glass-input text-xs" 
                    placeholder="08X-XXX-XXXX" 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200/50 dark:border-white/5">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-5 py-2.5 bg-warehouse-orange hover:bg-warehouse-orange/95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-warehouse-orange/15 flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>{loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลส่วนตัว'}</span>
                </button>
              </div>
            </form>
          </GlassCard>

          {/* Change password form */}
          <GlassCard className="border border-slate-200/50 dark:border-white/5" delay={0.1}>
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-200/50 dark:border-white/5">
              <Key className="text-warehouse-orange" size={18} />
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">เปลี่ยนรหัสผ่านเพื่อความปลอดภัย (Change Password)</h4>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400">รหัสผ่านปัจจุบัน (Current Password)</label>
                <input 
                  type="password" 
                  required 
                  value={passwordForm.currentPassword} 
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} 
                  className="glass-input text-xs" 
                  placeholder="••••••••" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">รหัสผ่านใหม่ (New Password)</label>
                  <input 
                    type="password" 
                    required 
                    value={passwordForm.newPassword} 
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} 
                    className="glass-input text-xs" 
                    placeholder="••••••••" 
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400">ยืนยันรหัสผ่านใหม่ (Confirm New Password)</label>
                  <input 
                    type="password" 
                    required 
                    value={passwordForm.confirmPassword} 
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} 
                    className="glass-input text-xs" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200/50 dark:border-white/5">
                <button 
                  type="submit" 
                  disabled={passwordLoading}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-white/5 dark:hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-slate-200/50 dark:border-white/5 flex items-center gap-1.5"
                >
                  <Key size={14} />
                  <span>{passwordLoading ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}</span>
                </button>
              </div>
            </form>
          </GlassCard>

        </div>

      </div>

    </div>
  );
}
