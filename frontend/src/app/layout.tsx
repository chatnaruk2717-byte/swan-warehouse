'use client';

import React from 'react';
import './globals.css';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <head>
        <title>Warehouse Training & Skill Management System</title>
        <meta name="description" content="ระบบบริหารจัดการการฝึกอบรมและทักษะของพนักงานคลังสินค้าสำหรับองค์กรยุคใหม่" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  const isLoginPage = pathname === '/login';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warehouse-light dark:bg-warehouse-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-slate-300 border-t-warehouse-orange animate-spin" />
          <p className="text-sm font-semibold text-slate-500">กำลังโหลดระบบ...</p>
        </div>
      </div>
    );
  }

  if (isLoginPage || !user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-warehouse-light dark:bg-slate-950 relative overflow-hidden">
      
      {/* AI Futuristic Background Watermark Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06] mix-blend-overlay">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/media__1782715533595.png')" }} />
      </div>
      
      {/* Futuristic AI Mesh Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-warehouse-orange/15 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-emerald-600/15 blur-[120px] pointer-events-none z-0" />

      {/*Collapsible Navigation Sidebar */}
      <div className="relative z-10 flex">
        <Sidebar />
      </div>
      
      {/*Main Workspace Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative z-10">
        {/* Top Navbar */}
        <Navbar />
        
        {/* Render page routing */}
        <main className="p-6 md:p-8 flex-1 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
