'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type PatientContextType = {
  patientName: string;
  patientId: number;
  setPatient: (patient: { name: string; patientId: number }) => void;
};

const PatientContext = createContext<PatientContextType | null>(null);

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patientName, setPatientName] = useState<string>('');
  const [patientId, setPatientId] = useState<number | null>(null);

  // 新增 setter 函式，提供更新能力
  const setPatient = (patient: { name: string; patientId: number }) => {
    setPatientName(patient.name);
    setPatientId(patient.patientId);
    localStorage.setItem('currentPatient', JSON.stringify(patient));
  };

//   從 localstorage 取 patient
  useEffect(() => {
    const raw = localStorage.getItem('currentPatient');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setPatientName(parsed.name || '');
        setPatientId(parsed.patientId || 0);
        console.log("PatientId =" + parsed.patientId+"PatientName =" + parsed.name)
      } catch (e) {
        console.error('PatientContext: 無法解析 currentPatient', e);
      }
    }
  }, []);

  return (
    <PatientContext.Provider value={{ 
      patientName, 
      patientId: patientId ?? 0, 
      setPatient }}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatient = () => {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatient 必須在 <PatientProvider> 中使用');
  return ctx;
};
