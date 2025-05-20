'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // 使用 Next.js 的 useRouter 來處理路由

type DashboardHeaderProps = {
  isCaregiver: number;
  patientName: string;
  alertTriggered?: boolean;
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ isCaregiver, patientName, alertTriggered }) => {
  const router = useRouter();


  const handleAlertClick = () => {
    router.push('/alert'); // 跳轉到 Alert 頁面
  };

  const handleVitalSignsClick = () => {
    router.push('/vitalsigns'); // 跳轉到 Vitalsigns 頁面
  };

  const handleTrendClick = () => {
    router.push('/trend'); // 跳轉到 Trend 頁面
  };

  const handlePersonaClick = () => {
    router.push('/user/caregiver'); // 跳轉到 Caregiver 頁面
  };

  const handleHomeClick = () => {
    router.push('/dashboard'); // 刷新頁面
  };

  return (
    <div className="flex justify-between items-center mb-8">
      {/* 左側標題與使用者資訊 */}
      <div className="flex items-center">
        <h1 className="text-2xl font-medium text-green-700 mr-4">eCare連心</h1>
        <div className="text-green-800">
          <div>目前身分: {isCaregiver ? '照顧者' : '家屬'}</div>
          <div>正在查看: {patientName}</div>
        </div>
      </div>

      {/* 導覽列 */}
      <nav className="flex items-center space-x-5">
        <ul className="flex items-center space-x-5">
          {/* 鈴鐺圖標 */}
          <li>
            <button className="group" onClick={handleAlertClick}>
              <img
                src={alertTriggered ? "/bell-alert.svg" : "/bell.svg"}
                alt="Bell Icon"
                className="w-10 h-10 group-hover:scale-110 transition-transform duration-200"
              />
            </button>
          </li>

          {/* 新增紀錄圖標 */}
          <li>
            <button className="group" onClick={handleVitalSignsClick}>
              <img
                src="/record.svg"
                alt="Record Icon"
                className="w-10 h-10 group-hover:scale-110 transition-transform duration-200"
              />
            </button>
          </li>

          {/* 趨勢圖標 */}
          <li>
            <button className="group"  onClick={handleTrendClick}>
              <img
                src="/trend-up.svg"
                alt="Trend Icon"
                className="w-10 h-10 group-hover:scale-110 transition-transform duration-200"
              />
            </button>
          </li>

          {/* 個人頁面圖標 */}
          <li>
            <button className="group"
            onClick={handlePersonaClick}
            >
              <img
                src="/profile.svg"
                alt="Profile Icon"
                className="w-10 h-10 group-hover:scale-110 transition-transform duration-200"
              />
            </button>
          </li>

          {/* 主畫面圖標 */}
          <li>
            <button
              className="group"
              onClick={handleHomeClick}
            >
              <img
                src="/home.svg"
                alt="Home Icon"
                className="w-10 h-10 group-hover:scale-110 transition-transform duration-200"
              />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default DashboardHeader;