"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useUser } from "@/contexts/DashboardUserContext";
import { usePatient } from "@/contexts/DashboardPatientContext";
import { all } from "axios";

type DashboardHeaderProps = {
  alertTriggered?: boolean;
  patientName: string;
  isCaregiver: number;
};

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  alertTriggered,
}) => {
  const router = useRouter();
  const { isCaregiver } = useUser();
  const { patientName, patientId } = usePatient();
  const [allAlertData, setAllAlertData] = useState<any[]>([]);

  // 可以用 useEffect 在元件掛載時或patientId改變時拉資料

  const handleAlertClick = () => {
    router.push(`/alert?patientId=${patientId}`);
  };

  const handleVitalSignsClick = () => {
    router.push("/vitalsigns");
  };
  // 暫時註解掉趨勢頁面的按鈕，因為未實作
  // const handleTrendClick = () => {
  //   router.push('/trend');
  // };

  const handlePersonaClick = () => {
    router.push(isCaregiver ? "/user/caregiver" : "/user/family");
  };

  const handleHomeClick = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center">
        <h1 className="text-2xl font-medium text-green-700 mr-4">eCare連心</h1>
        <div className="text-green-800">
          <div>目前身分: {isCaregiver ? "照顧者" : "家屬"}</div>
          <div>正在查看: {patientName}</div>
        </div>
      </div>

      <nav className="flex items-center space-x-5">
        <ul className="flex items-center space-x-5">
          <li>
            <button className="group" onClick={handleAlertClick}>
              <img
                src={allAlertData.length > 0 ? "/bell-alert.svg" : "/bell.svg"}
                alt="Bell Icon"
                className="w-10 h-10 group-hover:scale-110 transition-transform duration-200"
              />
            </button>
          </li>
          <li>
            <button className="group" onClick={handleVitalSignsClick}>
              <img
                src="/record.svg"
                alt="Record Icon"
                className="w-10 h-10 group-hover:scale-110 transition-transform duration-200"
              />
            </button>
          </li>
          {/* 暫時註解掉趨勢頁面的按鈕，因為未實作 */}
          {/* <li>
            <button className="group" onClick={handleTrendClick}>
              <img src="/trend-up.svg" alt="Trend Icon" className="w-10 h-10" />
            </button>
          </li> */}
          <li>
            <button className="group" onClick={handleHomeClick}>
              <img
                src="/home.svg"
                alt="Home Icon"
                className="w-10 h-10 group-hover:scale-110 transition-transform duration-200"
              />
            </button>
          </li>
          <li>
            <button className="group" onClick={handlePersonaClick}>
              <img
                src="/profile.svg"
                alt="Profile Icon"
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
