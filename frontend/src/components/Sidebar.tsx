'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import SwanLogo from './SwanLogo';
import { 
  LayoutDashboard, 
  Users, 
  Award, 
  BookOpen, 
  Briefcase, 
  Clock, 
  TrendingUp, 
  FileBarChart, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  FileText,
  Network,
  Map,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar = ({ mobileOpen, onCloseMobile }: SidebarProps) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const role = user.role;

  const menuItems = [
    {
      name: 'หน้าหลัก (Dashboard)',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'staff', 'employee']
    },
    {
      name: 'จัดการพนักงาน (Employees)',
      path: '/employees',
      icon: Users,
      roles: ['admin']
    },
    {
      name: 'ทักษะคลังสินค้า (Skill Matrix)',
      path: '/skills',
      icon: Award,
      roles: ['admin', 'staff', 'employee']
    },
    {
      name: 'คลังบทเรียน (Library)',
      path: '/courses',
      icon: BookOpen,
      roles: ['admin', 'staff', 'employee']
    },
    {
      name: 'กิจกรรมภายในแผนก (Activities)',
      path: '/activities',
      icon: Sparkles,
      roles: ['admin', 'staff', 'employee']
    },
    {
      name: 'Layout พื้นที่คลังสินค้า',
      path: '/warehouse-layout',
      icon: Map,
      roles: ['admin', 'staff', 'employee']
    },
    {
      name: 'เอกสารคลังสินค้า (Documents)',
      path: '/documents',
      icon: FileText,
      roles: ['admin', 'staff', 'employee']
    },
    {
      name: 'แผนผังองค์กร (Org Chart)',
      path: '/org-chart',
      icon: Network,
      roles: ['admin', 'staff', 'employee']
    },
    {
      name: 'งานที่รับมอบหมาย (Tasks)',
      path: '/tasks',
      icon: Briefcase,
      roles: ['admin', 'staff', 'employee']
    },
    {
      name: 'KPI แผนก (Department KPIs)',
      path: '/kpis',
      icon: TrendingUp,
      roles: ['admin', 'staff', 'employee']
    },
    {
      name: 'ผลงานรายบุคคล (Employee Performance)',
      path: '/performance',
      icon: Award,
      roles: ['admin', 'staff', 'employee']
    },
    {
      name: 'รายงานสรุป (Reports)',
      path: '/reports',
      icon: FileBarChart,
      roles: ['admin', 'staff']
    },
    {
      name: 'จัดการระบบ (System Settings)',
      path: '/admin',
      icon: Settings,
      roles: ['admin']
    }
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside 
        className={`glass-panel border-r border-slate-200/80 dark:border-white/10 h-screen fixed lg:sticky top-0 left-0 transition-all duration-300 z-50 lg:z-30 flex flex-col justify-between shadow-xl shadow-slate-900/5 ${
          collapsed ? 'w-20' : 'w-72'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Navigation Container */}
        <div className="flex flex-col min-h-0 flex-1">
          {/* Top Brand Logo Header - Aligned perfectly with Navbar py-6 height */}
          <div className="py-6 px-5 flex items-center justify-between border-b border-transparent relative shrink-0">
            {/* Sleek bottom border gradient line matching navbar */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-warehouse-orange/30 to-emerald-500/30" />
            {!collapsed ? (
              <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
                <SwanLogo className="h-9 w-9 shrink-0 shadow-md" />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm leading-none tracking-wide text-warehouse-navy dark:text-white truncate">Warehouse</span>
                  <span className="text-[9px] text-slate-400 font-medium tracking-wide mt-1 line-clamp-1">Swan Industries (Thailand) Limited</span>
                </div>
              </Link>
            ) : (
              <Link href="/dashboard" className="mx-auto block">
                <SwanLogo className="h-9 w-9 shadow-md" />
              </Link>
            )}

            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Menu Navigation List with Custom Scrollbar */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
            {filteredMenu.map((item) => {
              const Icon = item.icon;
              const cleanPathname = pathname?.replace(/\/$/, '') || '';
              const cleanItemPath = item.path.replace(/\/$/, '');
              const isActive = cleanPathname === cleanItemPath || (cleanItemPath !== '/dashboard' && cleanPathname.startsWith(cleanItemPath));
              
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-warehouse-orange to-amber-500 text-white shadow-md shadow-warehouse-orange/25 font-bold border border-white/10' 
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon size={18} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile & Logout */}
        <div className="p-3 border-t border-slate-200/60 dark:border-white/5 space-y-2 shrink-0 bg-slate-50/60 dark:bg-slate-900/60">
          {!collapsed && (
            <div className="bg-white dark:bg-white/5 p-2.5 rounded-xl flex items-center gap-3 border border-slate-200/60 dark:border-white/5 shadow-sm">
              {user?.photo_url ? (
                <img 
                  src={user.photo_url} 
                  alt={user.name || 'User'} 
                  className="w-9 h-9 rounded-lg object-cover ring-2 ring-warehouse-orange/20 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-warehouse-orange/20 text-warehouse-orange flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.name?.[0] || 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">{user?.name || 'ผู้ใช้งาน'}</p>
                <span className="text-[9px] uppercase font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  {(user?.role || 'admin').replace('_', ' ')}
                </span>
              </div>
            </div>
          )}

          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/10 transition-colors"
          >
            <LogOut size={18} className="shrink-0 text-rose-400" />
            {!collapsed && <span>ออกจากระบบ (Logout)</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
