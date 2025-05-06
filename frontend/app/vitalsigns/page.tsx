'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // 使用 useSearchParams 來獲取查詢參數
import DashboardHeader from '../../components/dashboard/DashboardHeader';

const VitalSignsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || ''; // 獲取 URL 中的 category 參數

  const isCaregiver = true; // 假設為照顧者
  const patientName = '王小明'; // 假設的病患名稱

  const [records, setRecords] = useState<Array<{
    id: number;
    date: string;
    time: string;
    period: string;
    value: number;
    unit: string;
    note: string;
    category: string;
  }>>([
    { id: 1, date: '2025年3月16日 星期日', time: '19:10', period: '飯後', value: 120, unit: 'mg/dL', note: '', category: '血糖' },
    { id: 2, date: '2025年3月15日 星期六', time: '11:50', period: '飯前', value: 85, unit: 'mg/dL', note: '', category: '血糖' },
  ]);

  const [newRecord, setNewRecord] = useState({
    period: '',
    value: '',
    note: '',
    category: category,
  });

  const [showPopup, setShowPopup] = useState(false); // 控制 Popup 的顯示
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null); // 要刪除的紀錄 ID

  useEffect(() => {
    // 如果 URL 中的 category 發生變化，更新狀態
    setNewRecord((prev) => ({ ...prev, category: category || '' }));
  }, [category]);

  const handleAddRecord = async () => {
    if (!newRecord.value || !newRecord.category || (newRecord.category === '血糖' && !newRecord.period)) {
      alert('請填寫完整的紀錄資訊！');
      return;
    }

    // 假資料處理
    const newId = records.length + 1;
    const newDate = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    const newTime = new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });

    const newRecordData = {
      id: newId,
      date: newDate,
      time: newTime,
      period: newRecord.period,
      value: parseFloat(newRecord.value),
      unit: 'mg/dL', 
      note: newRecord.note,
      category: newRecord.category,
    };

    setRecords([newRecordData, ...records]);

    // 與後端 API 的連結（目前註解掉）
    /*
    try {
      const response = await fetch('/vitalSigns/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer <token>`, // 替換為實際的 token
        },
        body: JSON.stringify({
          userId: '<userId>', // 替換為實際的 userId
          patientID: '<patientID>', // 替換為實際的 patientID
          vitalTypeId: getVitalTypeId(newRecord.category), // 根據類別獲取對應的 vitalTypeId
          weight: newRecord.category === '體重' ? parseFloat(newRecord.value) : undefined,
          bloodSugar: newRecord.category === '血糖' ? parseFloat(newRecord.value) : undefined,
          systolic: newRecord.category === '血壓' ? parseFloat(newRecord.value) : undefined, // 假設為收縮壓
          diastolic: undefined, // 如果需要舒張壓，需額外處理
          bloodO2: newRecord.category === '血氧' ? parseFloat(newRecord.value) : undefined,
          heartRate: newRecord.category === '心跳' ? parseFloat(newRecord.value) : undefined,
          comment: newRecord.note,
          create_date: new Date().toISOString(), // ISO 格式的日期
          time: newRecord.period, // 飯前/飯後
        }),
      });

      const result = await response.json();
      if (!result.success) {
        alert(`新增失敗: ${result.err}`);
      }
    } catch (error) {
      console.error('新增數據失敗:', error);
      alert('新增數據失敗，請稍後再試');
    }
    */

    // 清空輸入框
    setNewRecord({ period: '', value: '', note: '', category: '' });
  };

  const getVitalTypeId = (category: string): number => {
    switch (category) {
      case '心跳':
        return 1;
      case '血氧':
        return 2;
      case '血壓':
        return 3;
      case '體重':
        return 4;
      case '血糖':
        return 5;
      default:
        return 0; // 未知類別
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-8 shadow-md">
        {/* 使用 DashboardHeader */}
        <DashboardHeader isCaregiver={isCaregiver} patientName={patientName} />

        {/* 標題 */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">健康紀錄</h1>

        {/* 新增紀錄表單 */}
        <div className="mb-6 p-4 border border-blue-300 rounded-lg bg-blue-50">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-5">
            {/* 選擇類別 */}
            <select
              className="p-2 border rounded font-semibold text-green-600 dark:text-green-600"
              value={newRecord.category}
              onChange={(e) => setNewRecord({ ...newRecord, category: e.target.value, period: '' })}
            >
              <option value="">選擇類別</option>
              <option value="心跳">心跳</option>
              <option value="血氧">血氧</option>
              <option value="血壓">血壓</option>
              <option value="體重">體重</option>
              <option value="血糖">血糖</option>
            </select>

            {/* 輸入數值 */}
            <input
              type="number"
              placeholder="輸入數值"
              className="p-2 border rounded font-semibold text-green-600 dark:text-green-600"
              value={newRecord.value}
              onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })}
            />

            {/* 輸入備註（佔用兩格） */}
            <input
              type="text"
              placeholder="✏️輸入備註"
              className="p-2 border rounded font-semibold text-green-600 dark:text-green-600 col-span-2"
              value={newRecord.note}
              onChange={(e) => setNewRecord({ ...newRecord, note: e.target.value })}
            />

            {/* 送出按鈕 */}
            <button
              className="p-2 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition"
              onClick={handleAddRecord}
            >
              新增
            </button>

            {/* 選擇時段（僅在選擇血糖時顯示） */}
            {newRecord.category === '血糖' && (
              <select
                className="p-2 border rounded font-semibold text-blue-500 dark:text-sblue-400"
                value={newRecord.period}
                onChange={(e) => setNewRecord({ ...newRecord, period: e.target.value })}
              >
                <option hidden>選擇時段</option>
                <option value="飯前">飯前</option>
                <option value="飯後">飯後</option>
              </select>
            )}
          </div>
        </div>

        {/* 歷史紀錄 */}
        <ul className="space-y-4">
          {records.map((record) => record && (
            <li
              key={record.id}
              className="p-4 bg-white shadow rounded-lg border border-gray-200 flex justify-between items-center"
            >
              <div>
                <p className="text-sm text-gray-500">{record.date}</p>
                <p className="text-lg font-bold text-gray-800">
                  {record.category || '未知類別'} - {record.period || '未知時段'} {record.time || '未知時間'} - {record.value || '未知數值'} {record.unit || '未知單位'}
                </p>
                <p className="text-sm text-gray-500">備註: {record.note || '無'}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VitalSignsPage;