'use client';

import React from 'react';
import DashboardHeader from '../../components/dashboard/DashboardHeader'; // 引入 DashboardHeader

const AlertPage: React.FC = () => {
  // 模擬的歷史 alert 紀錄
  const alertRecords = [
    { id: 1, message: '血壓過高', timestamp: '2025-05-01 10:30' },
    { id: 2, message: '血氧過低', timestamp: '2025-05-02 14:15' },
    { id: 3, message: '心跳過快', timestamp: '2025-05-03 09:45' },
  ];

  const isCaregiver = true; // 假設為照顧者
  const patientName = '王小明'; // 假設的病患名稱

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-yellow-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-8 shadow-md">
        {/* 使用 DashboardHeader */}
        <DashboardHeader isCaregiver={isCaregiver} patientName={patientName} />

        {/* 歷史 Alert 紀錄 */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">歷史 Alert 紀錄</h1>
        <ul className="space-y-4">
          {alertRecords.map((record) => (
            <li
              key={record.id}
              className="p-4 bg-white shadow rounded-lg border border-gray-200"
            >
              <p className="text-lg font-medium text-red-600">{record.message}</p>
              <p className="text-sm text-gray-500">{record.timestamp}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AlertPage;