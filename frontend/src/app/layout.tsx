'use client';

import React, { useEffect, useState } from 'react';
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
  useEffect(() => {
    // Unregister any active service worker to prevent static caching issues
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then(() => {
            console.log('ServiceWorker unregistered successfully');
          });
        }
      });
    }
    // Clear browser caches to ensure the latest frontend files are loaded instantly
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          caches.delete(key);
        });
      });
    }
  }, []);

  return (
    <html lang="th">
      <head>
        <title>Warehouse Training & Skill Management System</title>
        <meta name="description" content="ระบบบริหารจัดการการฝึกอบรมและทักษะของพนักงานคลังสินค้าสำหรับองค์กรยุคใหม่" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Anti-caching Headers */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* PWA Settings */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F26522" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Swan Warehouse" />
        <link rel="apple-touch-icon" href="/swan_square_logo.png" />
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

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

      {/* Collapsible Navigation Sidebar */}
      <Sidebar mobileOpen={mobileSidebarOpen} onCloseMobile={() => setMobileSidebarOpen(false)} />
      
      {/* Main Workspace Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden relative z-10">
        {/* Top Navbar */}
        <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
        
        {/* Render page routing */}
        <main className="p-6 md:p-8 flex-1 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
