'use client';

import React, { useState } from 'react';
import DashboardHeader from '../../components/dashboard/DashboardHeader'; // 引入 DashboardHeader

const TrendPage: React.FC = () => {
  const isCaregiver = 1; // 假設為照顧者
  const patientName = '王小明'; // 假設的病患名稱

  // 控制 Pop-up 的狀態
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleButtonClick = (type: string) => {
    setSelectedType(type); // 設定選中的類型，顯示 Pop-up
  };

  const closePopup = () => {
    setSelectedType(null); // 關閉 Pop-up
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-8 shadow-md">
        {/* 使用 DashboardHeader */}
        <DashboardHeader isCaregiver={isCaregiver} patientName={patientName} />

        {/* 標題 */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          請問今天想要檢視何種生理數據健康圖表呢？
        </h1>

        {/* 五個按鈕 */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <button
            className="p-4 bg-green-100 hover:bg-green-200 rounded-lg shadow text-green-800 font-bold text-lg transition"
            onClick={() => handleButtonClick('血糖變化')}
          >
            血糖變化 <br />
            <span className="text-sm font-normal">Blood Sugar</span>
          </button>
          <button
            className="p-4 bg-green-100 hover:bg-green-200 rounded-lg shadow text-green-800 font-bold text-lg transition"
            onClick={() => handleButtonClick('血氧變化')}
          >
            血氧變化 <br />
            <span className="text-sm font-normal">Blood Oxygen</span>
          </button>
          <button
            className="p-4 bg-green-100 hover:bg-green-200 rounded-lg shadow text-green-800 font-bold text-lg transition"
            onClick={() => handleButtonClick('血壓變化')}
          >
            血壓變化 <br />
            <span className="text-sm font-normal">Blood Pressure</span>
          </button>
          <button
            className="p-4 bg-green-100 hover:bg-green-200 rounded-lg shadow text-green-800 font-bold text-lg transition"
            onClick={() => handleButtonClick('心率變化')}
          >
            心率變化 <br />
            <span className="text-sm font-normal">Heart Rate</span>
          </button>
          <button
            className="p-4 bg-green-100 hover:bg-green-200 rounded-lg shadow text-green-800 font-bold text-lg transition"
            onClick={() => handleButtonClick('體重變化')}
          >
            體重變化 <br />
            <span className="text-sm font-normal">Body Weight</span>
          </button>
        </div>
      </div>

      {/* Pop-up 視窗 */}
      {selectedType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{selectedType}</h2>
            <p className="text-gray-600 mb-4">這裡可以顯示 {selectedType} 的圖表內容。</p>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              onClick={closePopup}
            >
              關閉
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendPage;