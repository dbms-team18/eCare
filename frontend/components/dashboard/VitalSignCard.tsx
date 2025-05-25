import React from "react";
import { useAuth } from "../../contexts/AuthContext";

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
  showNoData?: boolean;
  onAddRecord?: (id: string) => void;
};

const VitalSignCard: React.FC<VitalSignCardProps> = ({
  vitalSign,
  isWide = false,
  showNoData = false,
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
  if (showNoData || vitalSign.value === null) {
    return (
      <div className="flex flex-col items-center justify-center h-20">
        <div className="text-gray-400 text-sm">No Data</div>
        <div className="text-gray-300 text-xs mt-1">點擊新增記錄</div>
      </div>
    );
  }

  const statusColor = vitalSign.status === '異常' ? 'text-red-500' : 'text-green-500';

  if (vitalSign.id === 'blood-pressure' && typeof vitalSign.value === 'object') {
    const { systolic, diastolic } = vitalSign.value as {
      systolic: number;
      diastolic: number;
    };

    return (
      <div className="flex items-end mt-3">
        <span className={`text-4xl font-bold ${statusColor}`}>{systolic}</span>
        <span className="text-gray-500 mx-2 mb-1">/</span>
        <span className={`text-4xl font-bold ${statusColor}`}>{diastolic}</span>
        <span className="text-gray-500 mb-1 ml-2">{vitalSign.unit}</span>
      </div>
    );
  }

  if (typeof vitalSign.value === 'number') {
    const value = vitalSign.value;
    const formattedValue =
      vitalSign.id === 'blood-sugar' ? value.toFixed(1) : value;

    return (
      <div className="flex items-end mt-3">
        <span className={`text-4xl font-bold ${statusColor}`}>{formattedValue}</span>
        <span className="text-gray-500 ml-2 mb-1">{vitalSign.unit}</span>
      </div>
    );
  }

  return null;
};

  
  
  return (
    <div
      className={`bg-white p-4 rounded-xl shadow-sm border ${isWide ? "col-span-2" : ""}`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{vitalSign.icon}</span>
          <span className="text-xl text-gray-500">{vitalSign.name}</span>
        </div>
        <span className={`font-semibold text-lg ${vitalSign.status === '異常' ? 'text-red-500' : 'text-green-500'}`}>

          {vitalSign.status}
        </span>
      </div>

      <div className="mt-2 flex justify-between items-end">
        {/* 數值與單位 */}
        <div className="flex items-end">{renderValue()}</div>

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
