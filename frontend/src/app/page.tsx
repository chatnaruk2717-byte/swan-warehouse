'use client';

import React, { useEffect } from 'react';
import DashboardPage from './dashboard/page';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login/';
    }
  }, [user, loading]);

  if (!user) {
    return null;
  }

  return <DashboardPage />;
}
