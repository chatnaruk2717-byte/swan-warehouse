'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export interface User {
  id: number;
  employee_id: string;
  email: string;
  role: 'admin' | 'staff' | 'employee';
  name: string;
  department: string;
  position: string;
  photo_url?: string;
  working_shift?: 'A' | 'B';
  phone?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (loginIdentifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchDemoRole: (role: 'admin' | 'staff' | 'employee') => void;
  updateProfile: (updatedUser: User) => void;
  api: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoProfiles: Record<User['role'], User> = {
  admin: { id: 1, employee_id: 'EMP001', email: 'admin@warehouse.com', role: 'admin', name: 'ชาติชาย  ทาคำห่อ', department: 'Management', position: 'Warehouse Manager', photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', working_shift: 'A' },
  staff: { id: 4, employee_id: 'EMP004', email: 'supervisor1@warehouse.com', role: 'staff', name: 'ประพันธ์ ยอดคุม', department: 'Operations', position: 'Zone A Supervisor', photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', working_shift: 'A' },
  employee: { id: 6, employee_id: 'EMP006', email: 'employee1@warehouse.com', role: 'employee', name: 'สมปอง ลุยงาน', department: 'Operations', position: 'Forklift Driver', photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', working_shift: 'A' }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Create axios instance pre-configured for the backend API
  const api = axios.create({
    baseURL: typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:5000'
      : 'https://swan-warehouse.onrender.com',
    timeout: 30000
  });

  // Intercept request to inject Authorization header
  api.interceptors.request.use((config) => {
    try {
      const savedToken = sessionStorage.getItem('token');
      if (savedToken) {
        config.headers.Authorization = `Bearer ${savedToken}`;
      }
    } catch (e) {
      console.error('Error reading token from sessionStorage:', e);
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  });

  useEffect(() => {
    try {
      const savedToken = sessionStorage.getItem('token');
      const savedUser = sessionStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } else {
        // Force redirect to login on fresh page entries
        setToken(null);
        setUser(null);
        router.push('/login');
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (loginIdentifier: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/api/auth/login', { loginIdentifier, password });
      const { token: jwtToken, user: loggedUser } = response.data;
      
      setToken(jwtToken);
      setUser(loggedUser);
      sessionStorage.setItem('token', jwtToken);
      sessionStorage.setItem('user', JSON.stringify(loggedUser));
      
      router.push('/dashboard');
      return true;
    } catch (err: any) {
      console.warn('API login failed, checking fallback credentials locally...');
      // Fallback matching password 'password123'
      if (password === 'password123') {
        const identifier = loginIdentifier.toLowerCase();
        let matchedRole: User['role'] | null = null;
        
        if (identifier.includes('admin') || identifier.includes('hr')) matchedRole = 'admin';
        else if (identifier.includes('staff') || identifier.includes('trainer') || identifier.includes('supervisor')) matchedRole = 'staff';
        else if (identifier.includes('employee') || identifier.includes('emp')) matchedRole = 'employee';

        if (matchedRole) {
          const profile = demoProfiles[matchedRole];
          const mockToken = `mock_jwt_token_for_${matchedRole}`;
          
          setToken(mockToken);
          setUser(profile);
          sessionStorage.setItem('token', mockToken);
          sessionStorage.setItem('user', JSON.stringify(profile));
          router.push('/dashboard');
          return true;
        }
      }
      throw new Error(err.response?.data?.message || 'Login failed. Please check credentials.');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  const switchDemoRole = (role: User['role']) => {
    const profile = demoProfiles[role];
    const mockToken = `mock_jwt_token_for_${role}`;
    
    setToken(mockToken);
    setUser(profile);
    sessionStorage.setItem('token', mockToken);
    sessionStorage.setItem('user', JSON.stringify(profile));
    
    // Refresh page/routing after role switch
    router.refresh();
  };

  const updateProfile = (updatedUser: User) => {
    setUser(updatedUser);
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, switchDemoRole, updateProfile, api }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
