'use client'

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// 用戶角色類型
export type UserRole = 0 | 1; // 0: caregiver, 1: family

// 用戶類型
export type User = {
  id: string;
  name: string;
  role: UserRole;
  // 其他用戶可能需要的屬性
};

// 認證上下文的類型
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isCaregiver: () => boolean;
  isFamily: () => boolean;
};

// 創建認證上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props 類型
type AuthProviderProps = {
  children: ReactNode;
};

// 認證提供者組件
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 在組件掛載時檢查是否已經登入
  useEffect(() => {
    // 這裡從 localStorage 或 cookies 或 API 獲取用戶數據
    const checkAuth = async () => {
      try {
        // 模擬從 localStorage 獲取用戶數據
        const savedUser = localStorage.getItem('user');
        
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          // 如果沒有登入數據，默認設為照顧者角色（便於開發測試）
          const defaultUser: User = {
            id: 'dev-user',
            name: '默認用戶',
            role: 0,
          };
          setUser(defaultUser);
        }
      } catch (error) {
        console.error('認證檢查失敗:', error);
        // 認證失敗時設置默認用戶（便於開發）
        const defaultUser: User = {
          id: 'dev-user',
          name: '默認用戶',
          role: 0,
        };
        setUser(defaultUser);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 模擬登入功能
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // 在實際應用中，這裡會調用 API 進行認證
      // 這裡僅作演示
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 假設登入成功，設置用戶數據
      const mockUser: User = {
        id: '123',
        name: username,
        role: username.toLowerCase().includes('care') ? 0 : 1,
      };
      
      // 將用戶資料保存到 localStorage
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      setUser(mockUser);
      return true;
    } catch (error) {
      console.error('登入失敗:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 登出功能
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // 檢查是否為照顧者
  const isCaregiver = (): boolean => {
    return user?.role === 0;
  };

  // 檢查是否為家屬
  const isFamily = (): boolean => {
    return user?.role === 1;
  };

  // 提供上下文值
  const value = {
    user,
    isLoading,
    login,
    logout,
    isCaregiver,
    isFamily,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 創建使用認證的自定義 Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth 必須在 AuthProvider 內使用');
  }
  
  return context;
};