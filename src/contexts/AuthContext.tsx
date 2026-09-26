import React, { createContext, useContext, useState, useEffect } from 'react';
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
  user: any;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isLoading: boolean;
  loginOrRegisterUser: (nationalId: string, phone: string) => Promise<User>;
  lookupOrCreateUser: (nationalId: string, phone: string) => Promise<User>;
  lookupUserByNationalId: (nationalId: string, phone?: string) => Promise<User>;
  registerNewUser: (nationalId: string, phone: string, email: string) => Promise<User>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedUser !== 'undefined' && savedToken && savedToken !== 'undefined') {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    // Listen for Supabase auth state changes (e.g. Google OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const supaUser = session.user;
        const email = supaUser.email || '';
        const fullName = supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || email.split('@')[0];

        // Check if user exists in app_users
        const { data: existing } = await supabase
          .from('app_users')
          .select('*')
          .eq('email', email)
          .limit(1);

        let appUser: any;
        if (!existing || existing.length === 0) {
          // Create new app_users record
          const fileNumber = generateUniqueCustomerNumber();
          const newUser = {
            id: supaUser.id,
            full_name: fullName,
            email,
            file_number: fileNumber,
            role: 'user',
          };
          const { data: inserted } = await supabase
            .from('app_users')
            .insert(newUser)
            .select()
            .single();
          appUser = inserted || newUser;
        } else {
          appUser = existing[0];
          if (!appUser.file_number) {
            const fileNumber = generateUniqueCustomerNumber();
            await supabase.from('app_users').update({ file_number: fileNumber }).eq('id', appUser.id);
            appUser.file_number = fileNumber;
          }
        }

        const userData: User = {
          id: appUser.id,
          fullName: appUser.full_name,
          name: appUser.full_name,
          email: appUser.email,
          phone: appUser.phone,
          mobile: appUser.phone,
          national_id: appUser.national_id,
          nationalId: appUser.national_id,
          file_number: appUser.file_number,
          fileNumber: appUser.file_number,
          role: appUser.role as 'admin' | 'user',
        };

        setUser(userData);
        setToken(session.access_token);
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('user', JSON.stringify(userData));

        // Redirect based on role
        if (appUser.role === 'admin') {
          window.location.hash = '#/admin';
        } else {
          window.location.hash = '#/dashboard';
        }
      }
    });

    setIsLoading(false);
    return () => subscription.unsubscribe();
  }, []);

  const login = (data: AuthResponse) => {
    setUser(data.user);
    setToken(data.token || 'session');
    localStorage.setItem('token', data.token || 'session');
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.hash = '#/';
  };

  // Local storage helpers for seamless offline/preview fallback when Supabase is unconfigured or unreachable
  const LOCAL_USERS_KEY = 'rifans_offline_users';
  const getOfflineUsers = (): any[] => {
    try {
      const raw = localStorage.getItem(LOCAL_USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };
  const saveOfflineUser = (userRecord: any) => {
    try {
      const list = getOfflineUsers();
      const idx = list.findIndex(u => u.id === userRecord.id || u.national_id === userRecord.national_id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...userRecord };
      } else {
        list.push(userRecord);
      }
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(list));
    } catch (err) {
      console.warn('Failed to save offline user', err);
    }
  };

  // Lookup or create user WITHOUT logging in (for OTP flow)
  const lookupOrCreateUser = async (nationalId: string, phone: string): Promise<User> => {
    let existingUsers: any[] | null = null;
    let lookupError: any = null;

    try {
      const res = await supabase
        .from('app_users')
        .select('*')
        .eq('national_id', nationalId)
        .limit(1);
      existingUsers = res.data;
      lookupError = res.error;
    } catch (err) {
      lookupError = err;
    }

    // Resilient fallback if Supabase is unconfigured or returns an authorization/network error
    if (lookupError) {
      console.warn('Supabase lookup failed, falling back to local store:', lookupError);
      const offlineUsers = getOfflineUsers();
      let appUser = offlineUsers.find(u => u.national_id === nationalId);
      if (!appUser) {
        appUser = {
          id: `local-${Date.now()}`,
          full_name: `عميل ${nationalId.slice(-4)}`,
          email: '',
          phone: phone,
          national_id: nationalId,
          file_number: generateUniqueCustomerNumber(),
          role: 'user',
        };
        saveOfflineUser(appUser);
      } else if (phone && appUser.phone !== phone) {
        appUser.phone = phone;
        saveOfflineUser(appUser);
      }
      return {
        id: appUser.id,
        fullName: appUser.full_name,
        name: appUser.full_name,
        email: appUser.email,
        phone: appUser.phone,
        mobile: appUser.phone,
        national_id: appUser.national_id,
        nationalId: appUser.national_id,
        file_number: appUser.file_number,
        fileNumber: appUser.file_number,
        role: appUser.role as 'admin' | 'user',
      };
    }

    let appUser: any;

    if (!existingUsers || existingUsers.length === 0) {
      const fileNumber = generateUniqueCustomerNumber();
      const newUser = {
        id: Date.now().toString(),
        full_name: `عميل ${nationalId.slice(-4)}`,
        email: '',
        phone: phone,
        national_id: nationalId,
        file_number: fileNumber,
        role: 'user',
      };
      const { data: inserted, error: insertError } = await supabase
        .from('app_users')
        .insert(newUser)
        .select()
        .single();

      if (insertError) {
        console.warn('Failed inserting to Supabase, saving locally:', insertError);
        saveOfflineUser(newUser);
        appUser = newUser;
      } else {
        appUser = inserted;
        saveOfflineUser(inserted);
      }

      // Sync new contact to HubSpot (fire-and-forget)
      try {
        supabase.functions.invoke('hubspot-sync', {
          body: {
            action: 'upsert_contact',
            contact: {
              phone: appUser.phone,
              firstname: appUser.full_name,
              national_id: appUser.national_id,
              file_number: appUser.file_number,
            },
          },
        });
      } catch (e) {
        console.error('hubspot-sync (new contact) failed', e);
      }
    } else {
      appUser = existingUsers[0];
      const updates: any = {};
      if (appUser.phone !== phone) {
        updates.phone = phone;
        appUser.phone = phone;
      }
      if (!appUser.file_number) {
        appUser.file_number = generateUniqueCustomerNumber();
        updates.file_number = appUser.file_number;
      }
      if (Object.keys(updates).length > 0) {
        await supabase.from('app_users').update(updates).eq('id', appUser.id);
      }
      saveOfflineUser(appUser);
    }

    return {
      id: appUser.id,
      fullName: appUser.full_name,
      name: appUser.full_name,
      email: appUser.email,
      phone: appUser.phone,
      mobile: appUser.phone,
      national_id: appUser.national_id,
      nationalId: appUser.national_id,
      file_number: appUser.file_number,
      fileNumber: appUser.file_number,
      role: appUser.role as 'admin' | 'user',
    };
  };

  const loginOrRegisterUser = async (nationalId: string, phone: string): Promise<User> => {
    setIsLoading(true);
    try {
      const userData = await lookupOrCreateUser(nationalId, phone);
      login({ user: userData, token: `session-${userData.id}` });
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  // Lookup user by national ID (with resilient fallback for unconfigured/offline DB)
  const lookupUserByNationalId = async (nationalId: string, phone?: string): Promise<User> => {
    let existingUsers: any[] | null = null;
    let lookupError: any = null;

    try {
      const res = await supabase
        .from('app_users')
        .select('*')
        .eq('national_id', nationalId)
        .limit(1);
      existingUsers = res.data;
      lookupError = res.error;
    } catch (err) {
      lookupError = err;
    }

    // If Supabase has an error (unconfigured key / network error / etc.), use offline local store
    if (lookupError) {
      console.warn('Supabase lookup returned error, using local fallback:', lookupError);
      const offlineUsers = getOfflineUsers();
      let appUser = offlineUsers.find(u => u.national_id === nationalId);
      if (!appUser) {
        // Auto-provision local user profile so the user can test the app without blockers
        appUser = {
          id: `local-${Date.now()}`,
          full_name: `عميل ${nationalId.slice(-4)}`,
          email: '',
          phone: phone || '',
          national_id: nationalId,
          file_number: generateUniqueCustomerNumber(),
          role: 'user',
        };
        saveOfflineUser(appUser);
      } else if (phone && !appUser.phone) {
        appUser.phone = phone;
        saveOfflineUser(appUser);
      }
      return {
        id: appUser.id,
        fullName: appUser.full_name,
        name: appUser.full_name,
        email: appUser.email,
        phone: appUser.phone,
        mobile: appUser.phone,
        national_id: appUser.national_id,
        nationalId: appUser.national_id,
        file_number: appUser.file_number,
        fileNumber: appUser.file_number,
        role: appUser.role as 'admin' | 'user',
      };
    }

    if (!existingUsers || existingUsers.length === 0) {
      // Check offline store before throwing
      const offlineUsers = getOfflineUsers();
      const appUser = offlineUsers.find(u => u.national_id === nationalId);
      if (appUser) {
        return {
          id: appUser.id,
          fullName: appUser.full_name,
          name: appUser.full_name,
          email: appUser.email,
          phone: appUser.phone,
          mobile: appUser.phone,
          national_id: appUser.national_id,
          nationalId: appUser.national_id,
          file_number: appUser.file_number,
          fileNumber: appUser.file_number,
          role: appUser.role as 'admin' | 'user',
        };
      }
      throw new Error('لا يوجد حساب بهذه الهوية. يرجى إنشاء حساب جديد.');
    }
    const appUser = existingUsers[0];
    if (!appUser.file_number) {
      const fileNumber = generateUniqueCustomerNumber();
      await supabase.from('app_users').update({ file_number: fileNumber }).eq('id', appUser.id);
      appUser.file_number = fileNumber;
    }
    saveOfflineUser(appUser);
    return {
      id: appUser.id,
      fullName: appUser.full_name,
      name: appUser.full_name,
      email: appUser.email,
      phone: appUser.phone,
      mobile: appUser.phone,
      national_id: appUser.national_id,
      nationalId: appUser.national_id,
      file_number: appUser.file_number,
      fileNumber: appUser.file_number,
      role: appUser.role as 'admin' | 'user',
    };
  };

  // Create new user account (registration flow) - requires email
  const registerNewUser = async (nationalId: string, phone: string, email: string): Promise<User> => {
    let existing: any[] | null = null;
    try {
      const res = await supabase
        .from('app_users')
        .select('id')
        .eq('national_id', nationalId)
        .limit(1);
      existing = res.data;
    } catch {
      // ignore
    }

    if (existing && existing.length > 0) {
      throw new Error('يوجد حساب مسجل بهذه الهوية بالفعل. يرجى تسجيل الدخول.');
    }

    const offlineUsers = getOfflineUsers();
    if (offlineUsers.some(u => u.national_id === nationalId && u.email)) {
      throw new Error('يوجد حساب مسجل بهذه الهوية بالفعل. يرجى تسجيل الدخول.');
    }

    const fileNumber = generateUniqueCustomerNumber();
    const newUser = {
      id: Date.now().toString(),
      full_name: `عميل ${nationalId.slice(-4)}`,
      email: email.toLowerCase().trim(),
      phone,
      national_id: nationalId,
      file_number: fileNumber,
      role: 'user',
    };
    saveOfflineUser(newUser);

    try {
      const { data: inserted, error: insertError } = await supabase
        .from('app_users')
        .insert(newUser)
        .select()
        .single();

      if (!insertError && inserted) {
        saveOfflineUser(inserted);
      }
    } catch (e) {
      console.warn('Could not insert user into remote Supabase, saved locally', e);
    }

    try {
      supabase.functions.invoke('hubspot-sync', {
        body: {
          action: 'upsert_contact',
          contact: {
            email: newUser.email,
            phone: newUser.phone,
            firstname: newUser.full_name,
            national_id: newUser.national_id,
            file_number: newUser.file_number,
          },
        },
      });
    } catch (e) {
      console.error('hubspot-sync (new contact) failed', e);
    }

    return {
      id: newUser.id,
      fullName: newUser.full_name,
      name: newUser.full_name,
      email: newUser.email,
      phone: newUser.phone,
      mobile: newUser.phone,
      national_id: newUser.national_id,
      nationalId: newUser.national_id,
      file_number: newUser.file_number,
      fileNumber: newUser.file_number,
      role: newUser.role as 'admin' | 'user',
    };
  };

  const loginWithEmail = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      // Use server-side edge function for secure bcrypt password verification
      const { data, error } = await supabase.functions.invoke('verify-login', {
        body: { email, password },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || 'بيانات الدخول غير صحيحة');
      }

      const userData: User = {
        id: data.user.id,
        fullName: data.user.fullName,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        mobile: data.user.phone,
        national_id: data.user.national_id,
        nationalId: data.user.national_id,
        file_number: data.user.file_number || data.user.fileNumber,
        fileNumber: data.user.file_number || data.user.fileNumber,
        role: data.user.role as 'admin' | 'user',
      };

      login({ user: userData, token: `session-${data.user.id}` });
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    setIsLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      if (result.error) {
        throw new Error('فشل تسجيل الدخول بحساب Google');
      }

      // If redirected, the page will reload and we handle the session in useEffect
      // For now, throw a placeholder since the page will redirect
      throw new Error('جاري التحويل...');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithApple = async (): Promise<User> => {
    setIsLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("apple", {
        redirect_uri: window.location.origin,
      });

      if (result.error) {
        throw new Error('فشل تسجيل الدخول بحساب Apple');
      }

      throw new Error('جاري التحويل...');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, loginOrRegisterUser, lookupOrCreateUser, lookupUserByNationalId, registerNewUser, loginWithEmail, loginWithGoogle, loginWithApple }}>
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