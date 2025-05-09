'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // 使用 useRouter 來處理路由
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import PatientInfo from '../../components/dashboard/PatientInfo';
import VitalSignsGrid from '../../components/dashboard/VitalSignsGrid';
import { VitalSign } from '../../components/dashboard/VitalSignCard';

export default function Dashboard() {
  const router = useRouter();

  const patientData = {
    name: '王小明',
    message: '繼續保持！',
    vitalSigns: [
      { id: 'heart-rate', name: '心跳', value: 90, unit: 'bpm', status: '正常', icon: '❤️' },
      { id: 'blood-oxygen', name: '血氧', value: 99, unit: '%SpO2', status: '正常', icon: '🔴' },
      { id: 'blood-pressure', name: '血壓', value: { systolic: 100, diastolic: 80 }, unit: 'mmHg', status: '正常', icon: '💧' },
      { id: 'weight', name: '體重', value: 80, unit: 'kg', status: '正常', icon: '👣' },
      { id: 'blood-sugar', name: '血糖', value: 90, unit: 'mg/dL', status: '正常', icon: '📊' },
    ] as VitalSign[],
  };

  const handleAddRecord = (vitalSignId: string) => {
    // 跳轉到 /vitalsigns 並帶上類別資訊
    router.push(`/vitalsigns?category=${vitalSignId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-yellow-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-8 shadow-md">
        <DashboardHeader isCaregiver={true} patientName={patientData.name} />
        <div className="grid grid-cols-12 gap-6">
          <PatientInfo
            message={patientData.message}
            alertTriggered={patientData.vitalSigns.some(
              (vitalSign) =>
                (vitalSign.id === 'blood-pressure' &&
                  typeof vitalSign.value === 'object' &&
                  (vitalSign.value as { systolic: number; diastolic: number }).systolic > 120) ||
                (vitalSign.id === 'blood-oxygen' &&
                  typeof vitalSign.value === 'number' &&
                  vitalSign.value < 92)
            )}
          />
          <VitalSignsGrid vitalSigns={patientData.vitalSigns} onAddRecord={handleAddRecord} />
        </div>
      </div>
    </div>
  );
}