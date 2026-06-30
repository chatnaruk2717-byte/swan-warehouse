'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Sun, 
  Moon, 
  Bell, 
  User, 
  ChevronDown, 
  UserSquare2,
  LineChart,
  LogOut,
  Settings
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, switchDemoRole, api } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    // Fetch notifications from API
    api.get(`/api/auth/profile`) // Use profile endpoint to verify token, or mock list
      .then(() => {
        // Fallback or fetched notifications
        const list = [
          { id: 1, title: 'มอบหมายการเรียนรู้ใหม่', message: 'หลักสูตร WMS & RF Scanner ถูกมอบหมายให้คุณ', time: '1 ชม. ที่แล้ว', read: false },
          { id: 2, title: 'อนุมัติทักษะใหม่สำเร็จ', message: 'คุณได้รับการอนุมัติทักษะการขับ Forklift Level 4', time: '1 วัน ที่แล้ว', read: true }
        ];
        setNotifications(list);
      })
      .catch(() => {
        // Fallback list
        setNotifications([
          { id: 1, title: 'มอบหมายการเรียนรู้ใหม่', message: 'หลักสูตร WMS & RF Scanner ถูกมอบหมายให้คุณ', time: '1 ชม. ที่แล้ว', read: false },
          { id: 2, title: 'อนุมัติทักษะใหม่สำเร็จ', message: 'คุณได้รับการอนุมัติทักษะการขับ Forklift Level 4', time: '1 วัน ที่แล้ว', read: true }
        ]);
      });
  }, [user]);

  if (!user) return null;

  const rolesList: { role: typeof user.role; name: string }[] = [
    { role: 'admin', name: 'Admin (ผู้ดูแลระบบ)' },
    { role: 'staff', name: 'Staff (พนักงาน/หัวหน้า)' },
    { role: 'employee', name: 'Employee (พนักงานคลัง)' }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="glass-panel sticky top-0 w-full z-20 border-b border-transparent px-6 py-6 flex items-center justify-between transition-all duration-300">
      
      {/* Modern Sleek bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-warehouse-orange/30 to-emerald-500/30" />

      {/* Search / Section Info */}
      <div className="relative z-10">
        <h1 className="text-xl font-bold font-sans text-slate-800 dark:text-white flex items-center gap-2">
          <span>ระบบจัดการพนักงานคลังสินค้า</span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-warehouse-orange/15 text-warehouse-orange border border-warehouse-orange/20 font-extrabold uppercase tracking-wider shadow-sm">
            {user.role}
          </span>
        </h1>
        <p className="text-xs text-slate-400 font-medium">แผนกคลังสินค้า • อัปเดตข้อมูลล่าสุดเรียลไทม์</p>
      </div>

      {/* Action Utilities */}
      <div className="flex items-center gap-4">
        
        {/* DEMO ROLE SWITCHER BADGE */}
        <div className="relative">
          <button 
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-warehouse-orange/10 hover:bg-warehouse-orange/20 text-warehouse-orange transition-colors text-xs font-bold border border-warehouse-orange/30"
          >
            <UserSquare2 size={16} />
            <span>สลับบทบาท (Demo Role)</span>
            <ChevronDown size={14} />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel shadow-xl dark:shadow-black/30 border border-slate-200/60 dark:border-white/10 p-2 z-50">
              <p className="text-[10px] uppercase font-bold text-slate-400 px-3 py-2 tracking-wider">เลือกสิทธิ์จำลองระบบ</p>
              {rolesList.map((item) => (
                <button
                  key={item.role}
                  onClick={() => {
                    switchDemoRole(item.role);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    user.role === item.role 
                      ? 'bg-warehouse-orange/15 text-warehouse-orange font-semibold' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DARK / LIGHT THEME TOGGLE */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* NOTIFICATIONS CONTAINER */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-warehouse-red" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-panel shadow-xl dark:shadow-black/30 border border-slate-200/60 dark:border-white/10 p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-white/5">
                <span className="font-bold text-sm">การแจ้งเตือน (Notifications)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-warehouse-orange/10 text-warehouse-orange font-bold">
                  {unreadCount} ใหม่
                </span>
              </div>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-1">
                {notifications.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-2.5 rounded-xl text-xs transition-colors ${
                      item.read ? 'bg-transparent' : 'bg-warehouse-orange/5 border-l-2 border-warehouse-orange'
                    }`}
                  >
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{item.title}</p>
                    <p className="text-slate-400 mt-0.5">{item.message}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PROFILE BADGE */}
        <Link href="/profile" className="flex items-center gap-3 border-l border-slate-200/50 dark:border-white/5 pl-4 hover:opacity-80 transition-all cursor-pointer">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
            <span className="text-[10px] text-slate-400 font-medium">{user.position}</span>
          </div>
          {user.photo_url ? (
            <img 
              src={user.photo_url} 
              alt={user.name} 
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-warehouse-orange/20"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-warehouse-orange/20 text-warehouse-orange flex items-center justify-center font-bold">
              {user.name[0]}
            </div>
          )}
        </Link>

      </div>
    </header>
  );
};

export default Navbar;
