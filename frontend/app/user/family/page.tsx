'use client'

// app/user/profile/page.tsx
import Button from '../../../components/Button'
import UserInfoHeader from '../../../components/UserInfoHeader'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BiUser, BiPlus, BiArrowBack } from 'react-icons/bi'
import { FaExchangeAlt } from "react-icons/fa";
import { usePatient } from '@/contexts/DashboardPatientContext';
import { useAlert } from '@/contexts/DashboardAlertContext'

interface Patient {
  patientId: number;
  name: string;
  idNum: string;
  age: number;
}

export default function ProfilePage() {
    const {alertTriggered, setalertTriggered} = useAlert()
    const { setPatient } = usePatient();
    const router = useRouter()
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedId, setSelectedId] = useState('')
    const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
    fetch("http://localhost:3001/api/patient/getAll", {
      credentials: "include", // 加這行才能送出 cookie
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPatients(data.data);
          if (data.message) {
            console.log(data.message);
          }
        } else {
          alert(data.message || "病患資料載入失敗");
        }
      })
      .catch((err) => {
        console.error("錯誤:", err);
        alert("連線失敗");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

 const fetchAlerts = async (patientId: string) => {

  try {
    const res = await fetch("http://localhost:3001/api/alert/getUnread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ 
        patientID: patientId }),
    });

    const result = await res.json();
    if (result.success && Array.isArray(result.allAlertData)) {
      
      // 有 alert 就設為觸發
      const isTriggered = result.allAlertData.length > 0;
      localStorage.setItem("alertTriggered",isTriggered? "1" : "0")
      setalertTriggered(isTriggered > 0 ? 1 : 0)
      console.log("成功回傳:", result);
    } else {
      console.warn("警報資料格式錯誤:", result);
      localStorage.setItem("alertTriggered", "0");
      setalertTriggered(0);
    }
  } catch (err) {
    console.error("警報資料取得失敗:", err);
    localStorage.setItem("alertTriggered", "0");
    setalertTriggered(0);


  }
};



    const handleSubmit = async () => {
    const selected = patients.find((p) => String(p.patientId) === selectedId);
    if (!selected) {
    alert("請先選擇一位個案");
    return;
  }

  setPatient({ patientId: Number(selected.patientId), name: selected.name });
  localStorage.setItem("currentPatient", JSON.stringify(selected));
  console.log("Selected ID:", selectedId);
  console.log("Selected Patient:", selected);

  await fetchAlerts(selectedId); // 呼叫正確的警報 fetch 函式

  alert(`已切換至個案：${selected.name}`);
  router.push("/dashboard");
};

    return (
      <div>
        <UserInfoHeader />
        
        <div className="relative min-h-screen flex items-center justify-center bg-[#d6f5f0] px-4">
      
          {/* 🔹 主卡片內容 🔹 */}
          <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
            
            {/* 返回箭頭 + 標題 */}
            <div className="flex items-center gap-2 mb-6 text-gray-800">
              <Link href="/" className="text-gray-600 hover:text-black text-2xl">
                <BiArrowBack />
              </Link>
              <h2 className="text-2xl font-bold">
                請選擇您要查看的個案
              </h2>
            </div>

            {/* 個案列表 */}
            <div className="space-y-4 mb-6">
              {patients.map((p) => (
                <label
                  key={p.patientId}
                  className="flex items-center gap-3 border border-gray-300 rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition-all"
                >
                  <input
                    type="radio"
                    name="selectedPatient"
                    value={p.patientId}
                    checked={selectedId === String(p.patientId)}
                    onChange={() => setSelectedId(String(p.patientId))}
                    className="accent-blue-500"
                  />
                  <div>
                    <div className="flex items-center gap-2 text-gray-900">
                      <BiUser />
                      <span className="font-semibold">{p.name}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      身分證：{p.idNum.slice(-4)}｜年齡：{p.age}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* 功能按鈕 */}
            <div className="flex flex-col items-center space-y-3">
            <Button
                label="綁定病患"
                icon={BiPlus}
                className="w-full"
                onClick={() => router.push('/patient/bind')}
              />
              <Button
                label="確認切換"
                icon={FaExchangeAlt}
                className="w-full"
                onClick={handleSubmit}
              />
              
            </div>
          </div>
        </div>

    </div>
      
    )
  }
  