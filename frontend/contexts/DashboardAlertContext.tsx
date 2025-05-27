"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type AlertContextType = {
  alertTriggered: number;
  setalertTriggered: (value: number) => void;
};

const AlertContext = createContext<AlertContextType | null>(null);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [alertTriggered, _setalertTriggered] = useState<number>(1); // 預設為家屬（1）

  // 新增 setter 函式，提供更新能力
  const setalertTriggered = (newalertTriggered: number) => {
    _setalertTriggered(newalertTriggered);
    localStorage.setItem("alertTriggered", JSON.stringify(newalertTriggered));
  };

 

  //   從 localstorage 取 alertTriggered
  useEffect(() => {
    const raw = localStorage.getItem("alertTriggered");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setalertTriggered(parsed);
      } catch (e) {
        console.error("UserContext: 無法解析 alertTriggered", e);
      }
    }
    
  }, []);

  return (
    <AlertContext.Provider
      value={{
        alertTriggered, setalertTriggered
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert 必須在 <AlertProvider> 中使用");
  return ctx;
};
