"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import PatientInfo from "../../components/dashboard/PatientInfo";
import VitalSignsGrid from "../../components/dashboard/VitalSignsGrid";
import { idToCategory, unitMap, iconMap } from "@/constants/vitalSignMap";

interface VitalSignData {
  vitalTypeId: number;
  value: number;
  recordDateTime: Date;
  comment: string;
}

interface ApiResponse {
  success: boolean;
  data?: VitalSignData[];
  err?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [vitalSigns, setVitalSigns] = useState<
    Array<{
      signID: string;
      vitalTypeId: number;
      value: number | null;
      status: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 從 URL query parameters 獲取參數
  const [userId, setUserId] = useState<number | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);

  useEffect(() => {
    // 從 URL query parameters 獲取參數
    const urlParams = new URLSearchParams(window.location.search);
    const userIdParam = urlParams.get("userId");
    const patientIdParam = urlParams.get("patientId");

    if (userIdParam) {
      setUserId(parseInt(userIdParam, 10));
    }
    if (patientIdParam) {
      setPatientId(patientIdParam);
    }
  }, []);

  // 預設的生理數據類型 (1-6)
  const defaultVitalTypes = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    // 只有當 userId 和 patientId 都存在時才調用 API
    if (!userId || !patientId) {
      return;
    }

    const fetchVitalSigns = async () => {
      const params = new URLSearchParams({
        userId: userId.toString(),
        patientId: patientId.toString(),
      });
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:3001/api/dashboard/getTopVitalSigns?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          // 建立一個包含所有類型的地圖
          const vitalSignMap = new Map<number, VitalSignData>();
          result.data.forEach((item) => {
            vitalSignMap.set(item.vitalTypeId, item);
          });

          // 為每個預設類型創建數據，如果沒有數據則設為 null
          const formattedVitalSigns = defaultVitalTypes.map((typeId) => {
            const data = vitalSignMap.get(typeId);
            if (!data) {
              return {
                signID: String(typeId),
                vitalTypeId: typeId,
                value: null,
                status: "目前無資料",
              };
            }

            // 判斷是否異常 - 根據資料庫的正常範圍
            let status = "正常";
            const value = data.value;

            switch (typeId) {
              case 1: // bloodSugar
                if (value > 140 || value < 70) status = "異常";
                break;
              case 2: // systolic
                if (value > 130 || value < 90) status = "異常";
                break;
              case 3: // diastolic
                if (value > 80 || value < 60) status = "異常";
                break;
              case 4: // heartRate
                if (value > 100 || value < 60) status = "異常";
                break;
              case 5: // bloodO2
                if (value > 100 || value < 95) status = "異常";
                break;
              case 6: // weight
                if (value > 100 || value < 40) status = "異常";
                break;
              default:
                status = "正常";
            }

            return {
              signID: String(typeId),
              vitalTypeId: typeId,
              value: data.value,
              status: status,
            };
          });

          setVitalSigns(formattedVitalSigns);
        } else {
          // API 返回錯誤或無數據
          const emptyVitalSigns = defaultVitalTypes.map((typeId) => ({
            signID: String(typeId),
            vitalTypeId: typeId,
            value: null,
            status: "目前無資料",
          }));
          setVitalSigns(emptyVitalSigns);
        }
      } catch (err) {
        console.error("獲取生理數據失敗:", err);
        setError(err instanceof Error ? err.message : "獲取數據失敗");

        // 錯誤時也要顯示預設結構
        const emptyVitalSigns = defaultVitalTypes.map((typeId) => ({
          signID: String(typeId),
          vitalTypeId: typeId,
          value: null,
          status: "目前無資料",
        }));
        setVitalSigns(emptyVitalSigns);
      } finally {
        setLoading(false);
      }
    };

    fetchVitalSigns();
  }, [userId, patientId]);

  // 如果還沒有獲取到必要參數，顯示提示
  if (!userId || !patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-green-100 to-yellow-100 p-4">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl p-8 shadow-md">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">
              請提供 userId 和 patientId 參數
              <br />
              例如: ?userId=1&patientId=patient123
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddRecord = (id: string) => {
    const vitalTypeId = Number(id);
    router.push(`/vitalsigns?category=${vitalTypeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-green-100 to-yellow-100 p-4">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl p-8 shadow-md">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">載入中...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-yellow-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-8 shadow-md">
        <DashboardHeader />

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            錯誤: {error}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          <PatientInfo message="繼續保持！" alertTriggered={false} />
          <VitalSignsGrid
            vitalSigns={vitalSigns.map((vitalSign) => ({
              id: vitalSign.signID,
              name: idToCategory[String(vitalSign.vitalTypeId)],
              value: vitalSign.value,
              unit:
                vitalSign.value !== null ? unitMap[vitalSign.vitalTypeId] : "",
              status: vitalSign.status,
              icon: iconMap?.[vitalSign.vitalTypeId] ?? "",
            }))}
            onAddRecord={handleAddRecord}
          />
        </div>
      </div>
    </div>
  );
}
