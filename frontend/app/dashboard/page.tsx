'use client';

import React from 'react';
// import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import PatientInfo from '../../components/dashboard/PatientInfo';
import VitalSignsGrid from '../../components/dashboard/VitalSignsGrid';
// import { VitalSignRecord } from '@/types/api';
import { idToCategory,unitMap, iconMap} from '@/constants/vitalSignMap';
import { getAlertMessage } from '@/lib/getAlertMessage';


export default function Dashboard() {
  const router = useRouter();

  const patientData = {
  name: '王小明',
  vitalSigns: [
    { signID: '1', vitalTypeId: 1, value: 90, status: '正常' },
    { signID: '4', vitalTypeId: 4, value: 80, status: '正常' },
    { signID: '2', vitalTypeId: 2, value: 99, status: '正常' },
    { signID: '3', vitalTypeId: 3, value: 100, status: '正常' },
    { signID: '5', vitalTypeId: 5, value: 80, status: '正常' },
    { signID: '6', vitalTypeId: 6, value: 90, status: '正常' },
  ] as Array<{ signID: string; vitalTypeId: number; value: number; status: string }>,
};

const alertTriggered = patientData.vitalSigns.some(
  (vitalSign) => {
    // 只要 getAlertMessage 回傳不是「正常」就算觸發
    const msg = getAlertMessage(vitalSign.vitalTypeId, vitalSign.value);
    return msg.includes('過高') || msg.includes('過低') || msg.includes('異常');
  }
);


  const handleAddRecord = (id: string) => {
    const vitalTypeId = Number(id);
    router.push(`/vitalsigns?category=${vitalTypeId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-yellow-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-8 shadow-md">
        <DashboardHeader patientName={patientData.name} isCaregiver={0} alertTriggered={alertTriggered} />
        <div className="grid grid-cols-12 gap-6">
          <PatientInfo alertTriggered={alertTriggered} />
          <VitalSignsGrid
            vitalSigns={patientData.vitalSigns.map((vitalSign) => ({
              id: vitalSign.signID,
              name: idToCategory[String(vitalSign.vitalTypeId)],
              value: vitalSign.value,
              unit: unitMap[vitalSign.vitalTypeId],
              status: vitalSign.status,
              icon: iconMap?.[vitalSign.vitalTypeId] ?? '',
            }))}
            onAddRecord={handleAddRecord}
          />
        </div>
      </div>
    </div>
  );
}