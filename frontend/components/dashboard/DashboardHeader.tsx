"use client";

// 套件
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { HiOutlineBell, HiMiniBell } from "react-icons/hi2";

// 本機檔案
import { useUser } from "@/contexts/DashboardUserContext";
import { usePatient } from "@/contexts/DashboardPatientContext";
import { useAlert } from "@/contexts/DashboardAlertContext";

type DashboardHeaderProps = {
  alertTriggered?: number;
  patientName: string;
  isCaregiver: number;
};



const DashboardHeader: React.FC<DashboardHeaderProps> = ({}) => {
  const router = useRouter();
  const { isCaregiver } = useUser();
  const { patientName, patientId } = usePatient();
  const { alertTriggered, setalertTriggered } = useAlert(); // 如果你只要用來顯示圖示



  // 可以用 useEffect 在元件掛載時或 patientId 改變時拉資料
useEffect(() => {
  const fetchAlertStatus = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/alert/getUnread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ patientID: patientId }),
      });
      const result = await res.json();
      if (result.success && Array.isArray(result.allAlertData)) {
        const isTriggered = result.allAlertData.length > 0;
        setalertTriggered(isTriggered ? 1 : 0);
      } else {
        setalertTriggered(0);
      }
    } catch (err) {
      setalertTriggered(0);
    }
  };

  if (patientId) {
    fetchAlertStatus(); // 初次執行一次
    const interval = setInterval(fetchAlertStatus, 10000); // 每 10 秒檢查一次
    return () => clearInterval(interval); // 清除定時器
  }
}, [patientId]);



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
              {alertTriggered === 1 ? (
                <HiMiniBell className="text-red-500  w-11 h-11 animate-bounce group-hover:scale-110 transition-transform duration-200 cursor-pointer" />) : 
                (<HiOutlineBell className="text-black  border-black w-11 h-11 group-hover:scale-110 transition-transform duration-200 cursor-pointer" />)
                }
            </button>
          </li>
          <li>
            <button className="group" onClick={handleVitalSignsClick}>
              <img
                src="/record.svg"
                alt="Record Icon"
                className="w-10 h-10 group-hover:scale-110 transition-transform duration-200 cursor-pointer"
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
                className="w-10 h-10 group-hover:scale-110 transition-transform duration-200 cursor-pointer"
              />
            </button>
          </li>
          <li>
            <button className="group" onClick={handlePersonaClick}>
              <img
                src="/profile.svg"
                alt="Profile Icon"
                className="w-10 h-10 group-hover:scale-110 transition-transform duration-200 cursor-pointer"
              />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default DashboardHeader;
