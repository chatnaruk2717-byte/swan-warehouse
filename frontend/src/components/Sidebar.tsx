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
  Network
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
        className={`glass-panel border-r border-slate-200/50 dark:border-white/5 h-screen fixed lg:sticky top-0 left-0 transition-all duration-300 z-50 lg:z-30 flex flex-col justify-between ${
          collapsed ? 'w-20' : 'w-72'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
      {/* Top Brand Logo */}
      <div>
        <div className="p-6 flex items-center justify-between border-b border-transparent relative transition-all duration-300">
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

        {/* Menu Navigation List */}
        <nav className="p-4 space-y-1">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={onCloseMobile}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-warehouse-orange to-amber-500 text-white shadow-lg shadow-warehouse-orange/30 glow-orange font-semibold border border-white/10' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/55 dark:hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={20} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Session Action */}
      <div className="p-4 border-t border-slate-200/50 dark:border-white/5 space-y-2">
        {!collapsed && (
          <div className="bg-slate-100/50 dark:bg-white/5 p-3 rounded-xl flex items-center gap-3">
            {user.photo_url ? (
              <img 
                src={user.photo_url} 
                alt={user.name} 
                className="w-10 h-10 rounded-lg object-cover ring-2 ring-warehouse-orange/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-warehouse-orange/20 text-warehouse-orange flex items-center justify-center font-bold">
                {user.name[0]}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">{user.name}</p>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {user.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        <button 
          onClick={logout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={20} className="shrink-0 text-rose-400" />
          {!collapsed && <span>ออกจากระบบ (Logout)</span>}
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
