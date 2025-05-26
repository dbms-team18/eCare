'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import { idToCategory } from '@/constants/vitalSignMap';


// 要抓取的資料（與前端回傳資料包名稱一樣）
type allAlertData = {
    alertId:number;
    userId: number;
    patientId: number;
    signId: number;
    alertType:string;
    alertMessage: string;
    alertTime: string;
    alertTrigger:boolean;
};


// 處理 timeStamp
function formatTimestamp(ts: string | number) {
  const s = typeof ts === 'number' ? ts.toString() : ts.replace(/[^0-9]/g, '');
  return `${s.slice(0,4)}/${s.slice(4,6)}/${s.slice(6,8)} ${s.slice(8,10)}:${s.slice(10,12)}`;
}
const AlertPage: React.FC = () => {
  
  // 從網址搜尋中抓 patientID
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');

    // 定義會更改的變數
  const [alerts, setAlerts] = useState<allAlertData[]>([]);
  

  // 用取到的 patientid 抓 alert 資料
  useEffect(() => {
    if (!patientId) {
    console.warn('無 patientId:', { patientId });
    return;
  }
    console.log('發送 alert API 請求：', { patientId });

    const fetchAlerts = async () => {
      try {
        // 建立 request ，格式要跟後端一樣
        const res = await fetch('http://localhost:3001/api/alert/getUnread', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // 傳 cookie
          body: JSON.stringify({
            patientID: patientId,

          }),
        });

        const result = await res.json();
        if (result.success && Array.isArray(result.allAlertData)) {
          setAlerts(result.allAlertData);
          console.log('成功回傳:', result);
        }
        else {
          console.warn('警報資料格式錯誤:', result);
          setAlerts([]); // 空陣列避免前端錯誤
          }
      } catch (err) {
        console.error('警報資料取得失敗:', err);
      }
    };

    fetchAlerts();
  }, [patientId]);

  const [confirmed, setConfirmed] = useState<Set<number>>(new Set());

  const handleConfirm = async (usr: number, id: number) => {
  try {
    const res = await fetch('http://localhost:3001/api/alert/readAlert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userID: usr,
        alertID: id,
      }),
    });

    const result = await res.json();
    if (result.success) {
      // 移除該筆 alert
      setAlerts(prev => prev.filter(record => record.alertId !== id));
    } else {
      console.warn('確認失敗:', result.message);
    }
  } catch (err) {
    console.error('API 呼叫錯誤:', err);
  }
};



  // 前端介面
  return (
    <div className="min-h-screen bg-gradient-to-r from-green-100 to-yellow-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-8 shadow-md">
          {/* 左上身份顯示  */}
          <DashboardHeader />
        <h1 className="text-2xl font-bold text-gray-800 mb-4">歷史 Alert 紀錄</h1>

        {alerts.length === 0 ? (
          <p className="text-gray-500">目前沒有未讀警報</p>
        ) : (
          <ul className="space-y-4">
            {alerts.map((record) => (
              
              <li
                key={record.alertId }
                className="p-4 bg-white shadow rounded-lg border border-gray-200 flex justify-between items-center"
              >
                <div>
                  <p className="text-lg font-medium text-red-600">
                    {idToCategory[String(record.alertType)]}：{record.alertMessage}
                  </p>
                  <p className="text-sm text-gray-500">
                    {record.alertTime ? formatTimestamp(record.alertTime) : '未知時間'}
                  </p>
                </div>
                <button
                  className={`px-4 py-2 rounded font-bold cursor-pointer ${
                    confirmed.has(record.alertId)
                      ? 'bg-gray-600 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                  onClick={() => handleConfirm(record.userId,record.alertId)}
                >
                  {'確認'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AlertPage;
