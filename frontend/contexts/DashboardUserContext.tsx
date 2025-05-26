"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type UserContextType = {
  isCaregiver: boolean;
  userId: number;
  role: number;
  setRole: (role: number) => void;
  setUser: (userId: number) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [role, _setRole] = useState<number>(1); // 預設為家屬（1）
  const [userId, _setUser] = useState<number>();

  // 新增 setter 函式，提供更新能力
  const setRole = (newRole: number) => {
    _setRole(newRole);
    localStorage.setItem("currentRole", JSON.stringify(newRole));
  };

  const setUser = (newUser: number) => {
    _setUser(newUser);
    localStorage.setItem("uid", JSON.stringify(newUser));
  };

  //   從 localstorage 取 role, uid
  useEffect(() => {
    const raw = localStorage.getItem("currentRole");
    const uid = localStorage.getItem("uid");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setRole(parsed);
      } catch (e) {
        console.error("UserContext: 無法解析 currentRole", e);
      }
    }
    if (uid) {
      try {
        const parsed = JSON.parse(uid);
        setUser(parsed);
      } catch (e) {
        console.error("UserContext: 無法解析 currentUser", e);
      }
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        userId,
        setUser,
        role,
        isCaregiver: role === 0,
        setRole,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser 必須在 <UserProvider> 中使用");
  return ctx;
};
