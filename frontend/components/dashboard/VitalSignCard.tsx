'use client';

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export type VitalSign = {
  id: string;
  name: string;
  value: number | { systolic: number; diastolic: number }; // 支援血壓的特殊結構
  unit: string;
  status: string;
  icon: string;
};

type VitalSignCardProps = {
  vitalSign: VitalSign;
  isWide?: boolean;
  onAddRecord?: (id: string) => void;
};

const VitalSignCard: React.FC<VitalSignCardProps> = ({
  vitalSign,
  isWide = false,
  onAddRecord,
}) => {
  // 模擬 isCaregiver 函數
  const isCaregiver = () => 1; // 假設為照顧者
  
  // 處理加號按鈕點擊
  const handleAddClick = () => {
    if (onAddRecord) {
      onAddRecord(vitalSign.id);
    }
  };
  
  // 為血壓值特別處理
  const renderValue = () => {
    if (vitalSign.id === 'blood-pressure' && typeof vitalSign.value === 'object') {
      const { systolic, diastolic } = vitalSign.value as { systolic: number; diastolic: number };

      // 定義血壓標準值
      const standardSystolic = 120;
      const standardDiastolic = 80;

      // 動態設定樣式
      const systolicColor = systolic > standardSystolic ? 'text-red-500' : 'text-green-500';
      const diastolicColor = diastolic > standardDiastolic ? 'text-red-500' : 'text-green-500';

      return (
        <div className="flex items-end mt-3">
          <span className={`text-4xl font-bold ${systolicColor}`}>{systolic}</span>
          <span className="text-gray-500 mx-2 mb-1">/</span>
          <span className={`text-4xl font-bold ${diastolicColor}`}>{diastolic}</span>
          <span className="text-gray-500 mb-1 ml-2">{vitalSign.unit}</span>
        </div>
      );
    }

    if (typeof vitalSign.value === 'number') {
      let colorClass = 'text-green-500'; // 預設為綠色
      const value = vitalSign.value;

      // 根據生命特徵設定顏色
      if (vitalSign.id === 'heart-rate') {
        colorClass = value < 60 || value > 100 ? 'text-red-500' : 'text-green-400';
      } else if (vitalSign.id === 'blood-oxygen') {
        colorClass = value < 92 ? 'text-red-500' : 'text-green-400';
      } else if (vitalSign.id === 'weight') {
        colorClass = value < 50 || value > 85 ? 'text-red-500' : 'text-green-400';
      } else if (vitalSign.id === 'blood-sugar') {
        // 假設飯前血糖
        colorClass = value < 70 || value > 99 ? 'text-red-500' : 'text-green-400';
      }

      const formattedValue =
        vitalSign.id === 'blood-sugar' ? value.toFixed(1) : value;

      return (
        <div className="flex items-end mt-3">
          <span className={`text-4xl font-bold ${colorClass}`}>{formattedValue}</span>
          <span className="text-gray-500 ml-2 mb-1">{vitalSign.unit}</span>
        </div>
      );
    }

    // 如果 value 不是數字或物件，返回空
    return null;
  };
  
  return (
    <div className={`bg-white p-4 rounded-xl shadow-sm border ${isWide ? 'col-span-2' : ''}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{vitalSign.icon}</span>
          <span className="text-xl text-gray-500">{vitalSign.name}</span>
        </div>
        <span className="text-green-500 font-semibold text-lg">{vitalSign.status}</span>
      </div>

      <div className="mt-2 flex justify-between items-end">
        {/* 數值與單位 */}
        <div className="flex items-end">
          {renderValue()}
        </div>

        {/* 新增紀錄按鈕 */}
        {isCaregiver() && (
          <button
            className="text-blue-500 hover:text-blue-700 transition-colors text-sm"
            onClick={handleAddClick}
          >
            + 新增紀錄
          </button>
        )}
      </div>

    </div>
  );
};

export default VitalSignCard;