'use client';

import React, { useState } from 'react';
import type { Alert } from '@/types/alert';
import { idToCategory } from '@/constants/vitalSignMap';
import { getAlertMessage } from '@/lib/getAlertMessage';
import DashboardHeader from '../../components/dashboard/DashboardHeader';

const initialAlertRecords: Alert[] = [
  {
    alertID: '1',
    alertTrigger: true,
    userId: 1,
    patientId: '1',
    vitalTypeId: 2,
    alertInfo: 72, //怪怪的，總之先寫了vitalSigns的數值
    timestamp: 202505011030,
    message: '收縮壓過低',
  },
  {
    alertID: '2',
    alertTrigger: true,
    userId: 1,
    patientId: '1',
    vitalTypeId: 1,
    alertInfo: 180,
    timestamp: 202505021415,
    message: '血糖過高',
  },
  {
    alertID: '3',
    alertTrigger: true,
    userId: 1,
    patientId: '1',
    vitalTypeId: 5,
    alertInfo: 88,
    timestamp: 202505030945,
    message: '血氧過低',
  },
];

const unitMap: Record<number, string> = {
  1: 'mg/dL',
  2: 'mmHg',
  3: 'mmHg',
  4: 'bpm',
  5: '%',
  6: 'kg',
};

function formatTimestamp(ts: number) {
  const s = ts.toString();
  return `${s.slice(0,4)}/${s.slice(4,6)}/${s.slice(6,8)} ${s.slice(8,10)}:${s.slice(10,12)}`;
}

const AlertPage: React.FC = () => {
  const [confirmed, setConfirmed] = useState<{ [id: string]: boolean }>({});
  const isCaregiver = 1;
  const patientName = '王小明';

  const handleConfirm = (id: string) => {
    setConfirmed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-yellow-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-8 shadow-md">
        <DashboardHeader isCaregiver={isCaregiver} patientName={patientName} />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">歷史 Alert 紀錄</h1>
        <ul className="space-y-4">
          {initialAlertRecords.map((record) => (
            <li
              key={record.alertID}
              className="p-4 bg-white shadow rounded-lg border border-gray-200 flex justify-between items-center"
            >
              <div>
                <p className="text-lg font-medium text-red-600">
                  {typeof record.vitalTypeId === 'number' && typeof record.alertInfo === 'number'
                    ? getAlertMessage(record.vitalTypeId, record.alertInfo)
                    : '異常警示'}
                </p>
                <p className="text-sm text-gray-500">
                  {record.timestamp !== undefined ? formatTimestamp(record.timestamp) : '未知時間'}
                </p>
                <p className="text-sm text-gray-700">
                  {idToCategory[String(record.vitalTypeId)]}：{record.alertInfo} {unitMap[record.vitalTypeId]}
                </p>
              </div>
              <button
                className={`px-4 py-2 rounded font-bold ${
                  confirmed[record.alertID]
                    ? 'bg-gray-600 text-white'
                    : 'bg-red-500 text-white'
                }`}
                onClick={() => handleConfirm(record.alertID)}
              >
                {confirmed[record.alertID] ? '已確認' : '待確認'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AlertPage;