'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useSearchParams } from 'next/navigation';

import { VitalSignRecord as BaseVitalSignRecord } from '@/types/api';
import { formatCreateDate } from '@/lib/format';

import { idToCategory, vitalTypeOptions } from '@/constants/vitalSignMap';
import DashboardHeader from '../../components/dashboard/DashboardHeader';

type VitalSignRecord = BaseVitalSignRecord & {
  period?: string;
  signID?: string;
};

const vitalMeta: Record<string, {
  unit: string;
  placeholder: string;
  min: number;
  max: number;
}> = {
  '1': { unit: 'mg/dL', placeholder: '輸入數值 單位: mg/dL', min: 0, max: 1000 }, // 血糖
  '2': { unit: 'mmHg', placeholder: '輸入數值 單位:mmHg', min: 0, max: 200 }, // 血壓-收縮壓
  '3': { unit: 'mmHg', placeholder: '輸入數值 單位:mmHg', min: 0, max: 130 },  // 血壓-舒張壓
  '4': { unit: 'bpm', placeholder: '輸入數值 單位: bpm', min: 0, max: 180 },   // 心跳
  '5': { unit: '%', placeholder: '輸入數值 單位: %', min: 0, max: 100 },       // 血氧
  '6': { unit: 'kg', placeholder: '輸入數值 單位: kg', min: 0, max: 300 },     // 體重
};

const VitalSignsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const vitalTypeIdFromQuery = searchParams.get('category') || '';

  const isCaregiver = 1;
  const patientName = '王小明';

  // 假資料
  const [records, setRecords] = useState<VitalSignRecord[]>([
    {
      signID: '1',
      userId: '1',
      patientID: '1',
      vitalTypeId: 1,
      bloodSugar: 110,
      create_date: 202505111150,
      comment: '早上空腹',
      period: '飯前',
    },
    {
      signID: '2',
      userId: '1',
      patientID: '1',
      vitalTypeId: 2,
      systolic: 120,
      create_date: 202505101450,
      comment: '下午紀錄',
    },
   {
      signID: '3',
      userId: '1',
      patientID: '1',
      vitalTypeId: 3,
      diastolic: 80, // 例如 80
      create_date: 202505101600,
      comment: '',
    }
  ]);

  // 新增紀錄表單
  const [newRecord, setNewRecord] = useState({
    period: '',
    value: '',
    comment: '',
    vitalTypeId: vitalTypeIdFromQuery || '',
    systolic: '',
    diastolic: '',
  });
  const vitalTypeId = String(newRecord.vitalTypeId);

  // 編輯/刪除 popup 狀態
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [editRecord, setEditRecord] = useState<any>(null);

  // 當 query string 改變時自動帶入類別
  useEffect(() => {
    setNewRecord((prev) => ({
      ...prev,
      vitalTypeId: vitalTypeIdFromQuery || '',
      period: '',
      value: '',
      systolic: '',
      diastolic: '',
    }));
  }, [vitalTypeIdFromQuery]);

  // 驗證數值
  const validateValue = (vitalTypeId: string, value: string) => {
  if (!vitalTypeId) return true;
  const meta = vitalMeta[vitalTypeId];
  if (!meta) return true;
  const num = Number(value);
  if (isNaN(num)) return '請輸入數字';
  if (num < meta.min || num > meta.max) {
    return `數值需在 ${meta.min} ~ ${meta.max} 之間`;
  }
  return true;
  };

  // 新增紀錄
  const handleAddRecord = () => {
  if (
    !newRecord.vitalTypeId ||
    !newRecord.value ||
    (newRecord.vitalTypeId === '1' && !newRecord.period)
  ) {
    alert('請填寫完整的紀錄資訊！');
    return;
  }
  const check = validateValue(
    newRecord.vitalTypeId,
    newRecord.value
  );
  if (check !== true) {
    alert(check);
    return;
  }
  const newId = (records.length + 1).toString();
  let record: VitalSignRecord = {
    signID: newId,
    userId: '1',
    patientID: '1',
    vitalTypeId: Number(newRecord.vitalTypeId),
    create_date: Number(dayjs().format('YYYYMMDDHHmm')),
    comment: newRecord.comment,
  };
  // 根據 vitalTypeId 存對應欄位
  if (newRecord.vitalTypeId === '1') {
    record.bloodSugar = Number(newRecord.value);
    record.period = newRecord.period;
  } else if (newRecord.vitalTypeId === '2') {
    record.systolic = Number(newRecord.value);
  } else if (newRecord.vitalTypeId === '3') {
    record.diastolic = Number(newRecord.value);
  } else if (newRecord.vitalTypeId === '4') {
    record.heartRate = Number(newRecord.value);
  } else if (newRecord.vitalTypeId === '5') {
    record.bloodO2 = Number(newRecord.value);
  } else if (newRecord.vitalTypeId === '6') {
    record.weight = Number(newRecord.value);
  }
  setRecords([record,...records]);
  setNewRecord({
    period: '',
    value: '',
    comment: '',
    vitalTypeId: '',
    systolic: '',
    diastolic: '',
  });
};

  // 刪除
  const confirmDelete = (id: string) => {
    setRecordToDelete(id);
    setShowDeletePopup(true);
  };
  const handleDelete = () => {
    setRecords(records.filter(r => r.signID !== recordToDelete));
    setShowDeletePopup(false);
    setRecordToDelete(null);
  };

  // 編輯
  const openEdit = (record: VitalSignRecord) => {
  setEditRecord({
    ...record,
    value:
      record.vitalTypeId === 1
        ? record.bloodSugar
        : record.vitalTypeId === 2
        ? record.systolic
        : record.vitalTypeId === 3
        ? record.diastolic
        : record.vitalTypeId === 4
        ? record.heartRate
        : record.vitalTypeId === 5
        ? record.bloodO2
        : record.vitalTypeId === 6
        ? record.weight
        : '',
      systolic: record.systolic ?? '',
      diastolic: record.diastolic ?? '',
    });
    setShowEditPopup(true);
  };
  const handleEditSave = () => {
    if (
      !editRecord.vitalTypeId ||
      (editRecord.vitalTypeId === 1 && !editRecord.value) ||
      (editRecord.vitalTypeId === 2 && (!editRecord.systolic || !editRecord.diastolic)) ||
      (editRecord.vitalTypeId !== 2 && !editRecord.value) ||
      (editRecord.vitalTypeId === 1 && !editRecord.period)
    ) {
      alert('請填寫完整的紀錄資訊！');
      return;
    }
    const check = validateValue(
      String(editRecord.vitalTypeId),editRecord.value);
    if (check !== true) {
      alert(check);
      return;
    }
    setRecords(records.map(r => {
      if (r.signID !== editRecord.signID) return r;
      let updated: VitalSignRecord = {
        ...r,
        vitalTypeId: Number(editRecord.vitalTypeId),
        comment: editRecord.comment,
        period: editRecord.period,
      };
      if (editRecord.vitalTypeId === 1) {
        updated.bloodSugar = Number(editRecord.value);
      } else if (editRecord.vitalTypeId === 2) {
        updated.systolic = Number(editRecord.systolic);
        updated.diastolic = Number(editRecord.diastolic);
      } else if (editRecord.vitalTypeId === 3) {
        updated.bloodO2 = Number(editRecord.value);
      } else if (editRecord.vitalTypeId === 4) {
        updated.heartRate = Number(editRecord.value);
      } else if (editRecord.vitalTypeId === 5) {
        updated.weight = Number(editRecord.value);
      }
      return updated;
    }));
    setShowEditPopup(false);
    setEditRecord(null);
  };

  // 取得單位
  const getUnit = (vitalTypeId: number | string) => {
    return vitalMeta[String(vitalTypeId)]?.unit || '';
  };
  console.log('vitalTypeId:', newRecord.vitalTypeId, 'placeholder:', vitalMeta[newRecord.vitalTypeId]?.placeholder);

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-8 shadow-md">
        <DashboardHeader isCaregiver={isCaregiver} patientName={patientName} />
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">健康紀錄</h1>
        <div className="mb-6 p-4 border border-blue-300 rounded-lg bg-blue-50">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-5">
            {/* 選擇類別 */}
            <select
              className="p-2 border rounded font-semibold text-green-600 dark:text-green-600"
              value={newRecord.vitalTypeId}
              onChange={e =>
                setNewRecord({
                  ...newRecord,
                  vitalTypeId: e.target.value,
                  value: '',
                  period: '',
                })
              }
            >
              <option value="">選擇類別</option>
              {vitalTypeOptions.map(opt => (
                <option key={opt.id} value={String(opt.id)}>
                  {opt.name}
                </option>
              ))}
            </select>
            {/* 輸入數值 */}
              <input
                type="number"
                placeholder={vitalMeta[newRecord.vitalTypeId]?.placeholder || '✏️輸入數值'}
                className="p-2 border rounded font-semibold text-green-600 dark:text-green-600"
                value={newRecord.value}
                onChange={e => setNewRecord({ ...newRecord, value: e.target.value })}
              />
            {/* 輸入備註（佔用兩格） */}
            <input
              type="text"
              placeholder="✏️輸入備註"
              className="p-2 border rounded font-semibold text-green-600 dark:text-green-600 col-span-2"
              value={newRecord.comment}
              onChange={e => setNewRecord({ ...newRecord, comment: e.target.value })}
            />
            {/* 送出按鈕 */}
            <button
              className="p-2 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition"
              onClick={handleAddRecord}
            >
              新增
            </button>
            {/* 選擇時段（僅在選擇血糖時顯示） */}
            {newRecord.vitalTypeId === '1' && (
              <select
                className="p-2 border rounded font-semibold text-blue-500 dark:text-sblue-400"
                value={newRecord.period}
                onChange={e => setNewRecord({ ...newRecord, period: e.target.value })}
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
          {records.map(record => {
            let value = '';
            if (record.vitalTypeId === 1) value = record.bloodSugar?.toString() ?? '未知數值';
            else if (record.vitalTypeId === 2) value = record.systolic?.toString() ?? '未知數值';
            else if (record.vitalTypeId === 3) value = record.diastolic?.toString() ?? '未知數值';
            else if (record.vitalTypeId === 4) value = record.heartRate?.toString() ?? '未知數值';
            else if (record.vitalTypeId === 5) value = record.bloodO2?.toString() ?? '未知數值';
            else if (record.vitalTypeId === 6) value = record.weight?.toString() ?? '未知數值';

            return (
              <li
                key={record.signID}
                className="p-4 bg-white shadow rounded-lg border border-gray-200 flex justify-between items-center"
              >
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    {idToCategory[String(record.vitalTypeId)] || '未知類別'}
                    {/* 只有血糖顯示 period */}
                    {record.vitalTypeId === 1 && ` - ${record.period || '未知時段'}`}
                    {` ${formatCreateDate(record.create_date)} - ${value} ${getUnit(record.vitalTypeId)}`}
                  </p>
                  <p className="text-sm text-gray-500">備註: {record.comment || '無'}</p>
                </div>
                <div className="flex space-x-2">
                  {/* 編輯icon */}
                  <button onClick={() => openEdit(record)} title="編輯">
                    <Pencil className="w-8 h-8 text-blue-500 hover:text-blue-700" />
                  </button>
                  {/* 刪除icon */}
                  <button onClick={() => confirmDelete(record.signID!)} title="刪除">
                    <Trash2 className="w-8 h-8 text-red-500 hover:text-red-700" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {/* 刪除 Popup */}
        {showDeletePopup && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <p className="mb-4 text-stone-800">確定要刪除這筆紀錄嗎？</p>
              <div className="flex justify-end space-x-2">
                <button className="px-4 py-2 bg-gray-500 rounded" onClick={() => setShowDeletePopup(false)}>
                  取消
                </button>
                <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={handleDelete}>
                  確定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 編輯 Popup */}
        {showEditPopup && editRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h2 className="text-lg text-stone-800 font-bold mb-4">編輯紀錄</h2>
              <div className="space-y-3">
                {/* 類別 */}
                <select
                  className="text-emerald-800 w-full p-2 border rounded"
                  value={editRecord.vitalTypeId}
                  onChange={e =>
                    setEditRecord({
                      ...editRecord,
                      vitalTypeId: e.target.value,
                      period: '',
                      value: '',
                      systolic: '',
                      diastolic: '',
                    })
                  }
                >
                  <option value="">選擇類別</option>
                  {vitalTypeOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                {/* 數值 */}
                {editRecord.vitalTypeId === '2' ? (
                  <>
                    <input
                      type="number"
                      className="text-emerald-800 w-full p-2 border rounded"
                      placeholder="收縮壓 mmHg"
                      value={editRecord.systolic}
                      onChange={e => setEditRecord({ ...editRecord, systolic: e.target.value })}
                    />
                    <input
                      type="number"
                      className="text-emerald-800 w-full p-2 border rounded"
                      placeholder="舒張壓 mmHg"
                      value={editRecord.diastolic}
                      onChange={e => setEditRecord({ ...editRecord, diastolic: e.target.value })}
                    />
                  </>
                ) : (
                  <input
                    type="number"
                    className="text-emerald-800 w-full p-2 border rounded"
                    placeholder={
                      vitalMeta[editRecord.vitalTypeId]?.placeholder || '✏️輸入數值'
                    }
                    value={editRecord.value}
                    onChange={e => setEditRecord({ ...editRecord, value: e.target.value })}
                  />
                )}
                {/* 備註 */}
                <input
                  type="text"
                  className="text-emerald-800 w-full p-2 border rounded"
                  placeholder="✏️輸入備註"
                  value={editRecord.comment}
                  onChange={e => setEditRecord({ ...editRecord, comment: e.target.value })}
                />
                {/* 血糖時段 */}
                {editRecord.vitalTypeId === '1' && (
                  <select
                    className="text-emerald-800 w-full p-2 border rounded"
                    value={editRecord.period}
                    onChange={e => setEditRecord({ ...editRecord, period: e.target.value })}
                  >
                    <option hidden>選擇時段</option>
                    <option value="飯前">飯前</option>
                    <option value="飯後">飯後</option>
                  </select>
                )}
                {/* 時間 */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="修改紀錄時間"
                    value={
                      editRecord.create_date
                        ? dayjs(
                            String(editRecord.create_date).slice(0, 4) + '-' +
                            String(editRecord.create_date).slice(4, 6) + '-' +
                            String(editRecord.create_date).slice(6, 8) + 'T' +
                            String(editRecord.create_date).slice(8, 10) + ':' +
                            String(editRecord.create_date).slice(10, 12)
                          )
                        : null
                    }
                    onChange={newValue => {
                      if (newValue && dayjs.isDayjs(newValue)) {
                        setEditRecord({
                          ...editRecord,
                          create_date: newValue.format('YYYYMMDDHHmm'),
                        });
                      }
                    }}
                    ampm={false}
                    views={['year', 'month', 'day', 'hours', 'minutes']}
                    format="YYYY/MM/DD HH:mm"
                  />
                </LocalizationProvider>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button className="px-4 py-2 bg-gray-500 rounded" onClick={() => setShowEditPopup(false)}>
                  取消
                </button>
                <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleEditSave}>
                  儲存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VitalSignsPage;