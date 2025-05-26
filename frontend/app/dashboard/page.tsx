"use client";

// 系統套件
import React from "react";
import { useRouter } from "next/navigation";
import { RowDataPacket } from "mysql2";
import { useEffect, useState } from "react";

// 專案元件
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import VitalSignsGrid from "../../components/dashboard/VitalSignsGrid";
// import { VitalSignRecord } from '@/types/api';
import PatientInfo from "../../components/dashboard/PatientInfo";
import { idToCategory, unitMap, iconMap } from "@/constants/vitalSignMap";
import { useUser } from "@/contexts/DashboardUserContext";
import { usePatient } from "@/contexts/DashboardPatientContext";
import { getAlertMessage } from "@/lib/getAlertMessage";

export default function Dashboard() {
  const router = useRouter();

  //  準備要用來接收的 rowData
  interface VitalSignRow extends RowDataPacket {
    signId: number;
    vitalTypeId: number;
    value: string;
    recordDateTime: Date;
    comment: string;
    status: number;
  }

  //  抓取要用的參數 userId, patientId
  const { userId } = useUser();
  const { patientId, patientName } = usePatient();

  //  即時更新 Dashboard
  const [topVitalSign, settopVitalSign] = useState<VitalSignRow[]>([]);

  useEffect(() => {
    if (!userId || !patientId) return;
    fetch(
      `http://localhost:3001/api/dashboard/getTopVitalSigns?patientId=${patientId}`,
      {
        credentials: "include", // 加這行才能送出 cookie
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          settopVitalSign(data.data);
          console.log(data);
          if (data.message) {
            console.log(data.message);
          }
        } else {
          alert(data.message || "Dashboard 載入失敗");
        }
      })
      .catch((err) => {
        console.error("錯誤:", err);
        alert("連線失敗");
      })
      .finally(() => {});
  }, []);

  // 創建預設的生理資料卡片（當沒有資料時顯示）
  const createDefaultVitalSigns = () => {
    const defaultVitalTypes = [1, 2, 3, 4, 5, 6]; // 假設這些是你的生理資料類型 ID

    return defaultVitalTypes.map((vitalTypeId) => ({
      signID: -1,
      vitalTypeId,
      value: null, // 設定為 null 表示沒有資料
      status: 2,
    }));
  };

  const vitalSignsToShow =
    topVitalSign.length > 0 ? topVitalSign : createDefaultVitalSigns();

  const patientData = {
    name: patientName,
    message: topVitalSign.length > 0 ? "繼續保持！" : "開始記錄您的健康數據！",
    vitalSigns: vitalSignsToShow.map((row) => ({
      // row.signId 沒錯
      signID: row.signId?.toString?.() ?? `default-${row.vitalTypeId}`,
      vitalTypeId: row.vitalTypeId,
      value: row.value !== null ? parseFloat(row.value) : null,
      status: row.status === 1 ? "異常" : row.status === 0 ? "正常" : "無資料",
    })),
  };

  const alertTriggered = patientData.vitalSigns.some((vitalSign) => {
    // 只要 getAlertMessage 回傳不是「正常」就算觸發
    const msg = getAlertMessage(vitalSign.vitalTypeId, vitalSign.value);
    return msg.includes("過高") || msg.includes("過低") || msg.includes("異常");
  });

  const handleAddRecord = (id: string) => {
    const vitalTypeId = Number(id);
    router.push(`/vitalsigns?category=${vitalTypeId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-yellow-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-8 shadow-md">
        <DashboardHeader
          patientName={patientData.name}
          isCaregiver={0}
          alertTriggered={alertTriggered}
        />
        <div className="grid grid-cols-12 gap-6">
          <PatientInfo
            message={patientData.message}
            alertTriggered={alertTriggered}
          />
          <VitalSignsGrid
            vitalSigns={patientData.vitalSigns.map((vitalSign) => ({
              id: vitalSign.signID,
              name: idToCategory[String(vitalSign.vitalTypeId)],
              value: vitalSign.value,
              unit: unitMap[vitalSign.vitalTypeId],
              status: vitalSign.status,
              icon: iconMap?.[vitalSign.vitalTypeId] ?? "",
              vitalTypeId: vitalSign.vitalTypeId,
            }))}
            onAddRecord={handleAddRecord}
            showNoData={topVitalSign.length === 0}
          />
        </div>
      </div>
    </div>
  );
}
