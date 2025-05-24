'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type UserContextType = {
  isCaregiver: boolean;
  role: number;
  setRole: (role: number) => void;

};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, _setRole] = useState<number>(1); // 預設為家屬（1）

 // 新增 setter 函式，提供更新能力
  const setRole = (newRole: number) => {
    _setRole(newRole);
  localStorage.setItem('currentRole', JSON.stringify(newRole));
};



  //   從 localstorage 取 role
  useEffect(() => {
    const raw = localStorage.getItem('currentRole');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setRole(parsed);
      } catch (e) {
        console.error('UserContext: 無法解析 currentRole', e);
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{ role, isCaregiver: role === 0, setRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser 必須在 <UserProvider> 中使用');
  return ctx;
};
