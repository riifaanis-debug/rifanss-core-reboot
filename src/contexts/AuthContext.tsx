import { invokeFunction } from "@/lib/functions";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';

interface User {
  id: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  national_id?: string;
  nationalId?: string;
  file_number?: string;
  fileNumber?: string;
  role?: 'admin' | 'user';
}

interface AuthResponse {
  // One-time token issued by the server after a verified OTP / admin password.
  token_hash?: string;
  user?: any;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: AuthResponse) => Promise<User | null>;
  logout: () => void;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  loginWithApple: () => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const normalizeSaudiPhone = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length > 10) cleaned = cleaned.slice(-10);
  return cleaned;
};

export const generateUniqueCustomerNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `RF-${year}${month}${day}-${randomPart}`;
};

// Short-lived cookie so same-origin file links (<img>, <a>) can be authorised by the server.
function setFileCookie(token: string | null) {
  if (typeof document === 'undefined') return;
  const base = 'path=/api/public/uploads; SameSite=None; Secure; Partitioned';
  document.cookie = token
    ? `rf_at=${encodeURIComponent(token)}; ${base}; max-age=3600`
    : `rf_at=; ${base}; max-age=0`;
}

async function loadProfile(authUserId: string): Promise<User | null> {
  const [{ data: appUser }, { data: roleRow }] = await Promise.all([
    supabase.from('app_users').select('*').eq('auth_user_id', authUserId).maybeSingle(),
    supabase.from('user_roles').select('role').eq('user_id', authUserId).eq('role', 'admin').maybeSingle(),
  ]);
  if (!appUser) return null;
  return {
    id: appUser.id,
    fullName: appUser.full_name ?? undefined,
    name: appUser.full_name ?? undefined,
    email: appUser.email ?? undefined,
    phone: appUser.phone ?? undefined,
    mobile: appUser.phone ?? undefined,
    national_id: appUser.national_id ?? undefined,
    nationalId: appUser.national_id ?? undefined,
    file_number: appUser.file_number ?? undefined,
    fileNumber: appUser.file_number ?? undefined,
    role: roleRow ? 'admin' : 'user',
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySession = useCallback(async (session: any) => {
    if (!session?.user) {
      setUser(null);
      setToken(null);
      setFileCookie(null);
      return null;
    }
    setToken(session.access_token);
    setFileCookie(session.access_token);
    const profile = await loadProfile(session.user.id);
    if (!profile) {
      // Signed in to the auth system but not linked to a customer account: not allowed.
      await supabase.auth.signOut();
      setUser(null);
      setToken(null);
      setFileCookie(null);
      return null;
    }
    setUser(profile);
    return profile;
  }, []);

  useEffect(() => {
    // Drop the legacy browser-only session and offline store (no database data is touched).
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('rifans_offline_users');
    } catch { /* ignore */ }

    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      await applySession(data.session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        setToken(session?.access_token ?? null);
        setFileCookie(session?.access_token ?? null);
        return;
      }
      if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'USER_UPDATED') return;
      setTimeout(async () => {
        const profile = await applySession(session);
        // Social sign-in callback: redirect after the session is confirmed
        if (event === 'SIGNED_IN' && profile && sessionStorage.getItem('oauth_pending')) {
          sessionStorage.removeItem('oauth_pending');
          window.location.hash = profile.role === 'admin' ? '#/admin' : '#/dashboard';
        }
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const login = async (data: AuthResponse): Promise<User | null> => {
    if (!data?.token_hash) throw new Error('تعذّر تسجيل الدخول');
    const { data: res, error } = await supabase.auth.verifyOtp({ token_hash: data.token_hash, type: 'magiclink' });
    if (error || !res.session) throw new Error('تعذّر تسجيل الدخول، يرجى المحاولة لاحقًا');
    const profile = await applySession(res.session);
    if (!profile) throw new Error('تعذّر تسجيل الدخول، يرجى المحاولة لاحقًا');
    return profile;
  };

  const logout = () => {
    supabase.auth.signOut().finally(() => {
      setUser(null);
      setToken(null);
      setFileCookie(null);
      window.location.hash = '#/';
    });
  };

  const loginWithEmail = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const { data, error } = await invokeFunction('verify-login', {
        body: { email, password },
      });
      if (error || !data?.success || !data?.token_hash) {
        throw new Error(data?.error || 'بيانات الدخول غير صحيحة');
      }
      const profile = await login({ token_hash: data.token_hash });
      if (!profile) throw new Error('بيانات الدخول غير صحيحة');
      return profile;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    setIsLoading(true);
    try {
      sessionStorage.setItem('oauth_pending', '1');
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        sessionStorage.removeItem('oauth_pending');
        throw new Error('فشل تسجيل الدخول بحساب Google');
      }
      throw new Error('جاري التحويل...');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithApple = async (): Promise<User> => {
    setIsLoading(true);
    try {
      sessionStorage.setItem('oauth_pending', '1');
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        sessionStorage.removeItem('oauth_pending');
        throw new Error('فشل تسجيل الدخول بحساب Apple');
      }
      throw new Error('جاري التحويل...');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, loginWithEmail, loginWithGoogle, loginWithApple }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
