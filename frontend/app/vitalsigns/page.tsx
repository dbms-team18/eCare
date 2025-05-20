"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useSearchParams } from "next/navigation";
import axios from "axios";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import { idToCategory, vitalTypeOptions } from "@/constants/vitalSignMap";
import { formatCreateDate } from "@/lib/format";

// Define interfaces
interface VitalSignRecord {
  signId?: string;
  userId: string;
  patientId: string;
  vitalTypeId: number;
  bloodSugar?: number;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  bloodO2?: number;
  weight?: number;
  create_date: number;
  comment: string;
  period?: string;
  value?: number | string; // For UI purposes
}

interface NewRecordForm {
  period: string;
  value: string;
  comment: string;
  vitalTypeId: string;
  systolic: string;
  diastolic: string;
  create_date?: string;
  time?: string;
}

interface VitalSignMetadata {
  unit: string;
  placeholder: string;
  min: number;
  max: number;
}

// Constants
const vitalMeta: Record<string, VitalSignMetadata> = {
  "1": {
    unit: "mg/dL",
    placeholder: "輸入數值 單位: mg/dL",
    min: 0,
    max: 1000,
  }, // 血糖
  "2": { unit: "mmHg", placeholder: "輸入數值 單位:mmHg", min: 0, max: 200 }, // 血壓-收縮壓
  "3": { unit: "mmHg", placeholder: "輸入數值 單位:mmHg", min: 0, max: 130 }, // 血壓-舒張壓
  "4": { unit: "bpm", placeholder: "輸入數值 單位: bpm", min: 0, max: 180 }, // 心跳
  "5": { unit: "%", placeholder: "輸入數值 單位: %", min: 0, max: 100 }, // 血氧
  "6": { unit: "kg", placeholder: "輸入數值 單位: kg", min: 0, max: 300 }, // 體重
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

const VitalSignsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const vitalTypeIdFromQuery = searchParams.get("category") || "";

  const isCaregiver = 1;
  const patientName = "王小明";
  const userId = "1";
  const patientId = "1";

  // State hooks
  const [records, setRecords] = useState<VitalSignRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [newRecord, setNewRecord] = useState<NewRecordForm>({
    period: "",
    value: "",
    comment: "",
    vitalTypeId: vitalTypeIdFromQuery || "",
    systolic: "",
    diastolic: "",
    create_date: dayjs().format("YYYY-MM-DD"),
    time: dayjs().format("HH:mm"),
  });

  // Modal/popup states
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [editRecord, setEditRecord] = useState<VitalSignRecord | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchVitalSigns();
  }, []);

  // Update form when query param changes
  useEffect(() => {
    setNewRecord((prev) => ({
      ...prev,
      vitalTypeId: vitalTypeIdFromQuery || "",
      period: "",
      value: "",
      systolic: "",
      diastolic: "",
    }));
  }, [vitalTypeIdFromQuery]);

  // API functions
  const fetchVitalSigns = async () => {
    try {
      // 使用環境變數來構建 API URL
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/vitalSign/getAll`;

      // 構建參數
      const params = new URLSearchParams({
        userId: userId.toString(),
        patientId: patientId.toString(),
      });

      const response = await fetch(`${apiUrl}?${params.toString()}`);

      if (!response.ok) {
        // 處理錯誤狀態
        const errorData = await response.json();
        throw new Error(errorData.err || "獲取生理指標失敗");
      }

      const data = await response.json();
      return data.vitalSigns;
    } catch (error) {
      console.error("獲取生理指標出錯:", error);
      throw error;
    }

    // Mock data for development
    //     if (process.env.NODE_ENV === "development") {
    //       setRecords([
    //         {
    //           signId: "1",
    //           userId: "1",
    //           patientId: "1",
    //           vitalTypeId: 1,
    //           bloodSugar: 110,
    //           create_date: 202505111150,
    //           comment: "早上空腹",
    //           period: "飯前",
    //         },
    //         {
    //           signId: "2",
    //           userId: "1",
    //           patientId: "1",
    //           vitalTypeId: 2,
    //           systolic: 120,
    //           create_date: 202505101450,
    //           comment: "下午紀錄",
    //         },
    //         {
    //           signId: "3",
    //           userId: "1",
    //           patientId: "1",
    //           vitalTypeId: 3,
    //           diastolic: 80,
    //           create_date: 202505101600,
    //           comment: "",
    //         },
    //       ]);
    //     }
    //   } finally {
    //     setLoading(false);
  };

  const createVitalSign = async (record: Omit<VitalSignRecord, "signId">) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/vitalSign/create`,
        record
      );

      const data = response.data as {
        success: boolean;
        signId?: string;
        err?: string;
      };

      if (data.success) {
        return data.signId;
      } else {
        setError(data.err || "Failed to create record");
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create record");
      console.error("Error creating vital sign:", err);
      return null;
    }
  };

  const updateVitalSign = async (record: {
    signId: string;
    userId: string;
    patientId: string;
    vitalTypeId: number;
    value: number;
    recordDateTime: string;
    comment: string;
  }) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/vitalSign/update`,
        record
      );

      const data = response.data as { success: boolean; err?: string };
      if (data.success) {
        return true;
      } else {
        setError(data.err || "Failed to update record");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update record");
      console.error("Error updating vital sign:", err);
      return false;
    }
  };

  const deleteVitalSign = async (signId: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/vitalSign/delete`, {
        signId,
      });

      const data = response.data as { success: boolean; err?: string };
      if (data.success) {
        return true;
      } else {
        setError(data.err || "Failed to delete record");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete record");
      console.error("Error deleting vital sign:", err);
      return false;
    }
  };

  // Validation helpers
  const validateValue = (vitalTypeId: string, value: string): true | string => {
    if (!vitalTypeId) return true;
    const meta = vitalMeta[vitalTypeId];
    if (!meta) return true;

    const num = Number(value);
    if (isNaN(num)) return "請輸入數字";
    if (num < meta.min || num > meta.max) {
      return `數值需在 ${meta.min} ~ ${meta.max} 之間`;
    }
    return true;
  };

  const isFormValid = (): true | string => {
    if (!newRecord.vitalTypeId) return "請選擇類別";

    if (newRecord.vitalTypeId === "1" && !newRecord.period) {
      return "請選擇時段";
    }

    if (!newRecord.value) {
      return "請輸入數值";
    }

    return validateValue(newRecord.vitalTypeId, newRecord.value);
  };

  // Event handlers
  const handleAddRecord = async () => {
    const validationResult = isFormValid();
    if (validationResult !== true) {
      alert(validationResult);
      return;
    }

    // Format date and time for API
    const currentDate = dayjs();
    const create_date = currentDate.format("YYYY-MM-DD");
    const time = currentDate.format("HH:mm");

    // Prepare record for API
    const recordToCreate: any = {
      userId,
      patientId: patientId,
      vitalTypeId: Number(newRecord.vitalTypeId),
      create_date,
      time,
      comment: newRecord.comment,
    };

    // Set type-specific fields
    switch (newRecord.vitalTypeId) {
      case "1": // 血糖
        recordToCreate.bloodSugar = Number(newRecord.value);
        // Store period for frontend display (this is not in the API)
        recordToCreate.period = newRecord.period;
        break;
      case "2": // 收縮壓
        recordToCreate.systolic = Number(newRecord.value);
        break;
      case "3": // 舒張壓
        recordToCreate.diastolic = Number(newRecord.value);
        break;
      case "4": // 心跳
        recordToCreate.heartRate = Number(newRecord.value);
        break;
      case "5": // 血氧
        recordToCreate.bloodO2 = Number(newRecord.value);
        break;
      case "6": // 體重
        recordToCreate.weight = Number(newRecord.value);
        break;
    }

    // Send to API and update UI
    const newId = await createVitalSign(recordToCreate);
    if (newId) {
      // Format the record for our UI with the format we use internally
      const uiRecord: VitalSignRecord = {
        signId: newId,
        userId,
        patientId: patientId,
        vitalTypeId: Number(newRecord.vitalTypeId),
        create_date: Number(currentDate.format("YYYYMMDDHHmm")),
        comment: newRecord.comment,
      };

      // Add type-specific data
      switch (Number(newRecord.vitalTypeId)) {
        case 1:
          uiRecord.bloodSugar = Number(newRecord.value);
          uiRecord.period = newRecord.period;
          break;
        case 2:
          uiRecord.systolic = Number(newRecord.value);
          break;
        case 3:
          uiRecord.diastolic = Number(newRecord.value);
          break;
        case 4:
          uiRecord.heartRate = Number(newRecord.value);
          break;
        case 5:
          uiRecord.bloodO2 = Number(newRecord.value);
          break;
        case 6:
          uiRecord.weight = Number(newRecord.value);
          break;
      }

      setRecords([uiRecord, ...records]);

      // Reset form
      setNewRecord({
        period: "",
        value: "",
        comment: "",
        vitalTypeId: "",
        systolic: "",
        diastolic: "",
        create_date: dayjs().format("YYYY-MM-DD"),
        time: dayjs().format("HH:mm"),
      });
    }
  };

  const confirmDelete = (id: string) => {
    setRecordToDelete(id);
    setShowDeletePopup(true);
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;

    const success = await deleteVitalSign(recordToDelete);
    if (success) {
      setRecords(records.filter((r) => r.signId !== recordToDelete));
      setShowDeletePopup(false);
      setRecordToDelete(null);
    }
  };

  const openEdit = (record: VitalSignRecord) => {
    // Create an editable copy with the value in the right field
    let value = "";
    switch (record.vitalTypeId) {
      case 1:
        value = record.bloodSugar?.toString() || "";
        break;
      case 2:
        value = record.systolic?.toString() || "";
        break;
      case 3:
        value = record.diastolic?.toString() || "";
        break;
      case 4:
        value = record.heartRate?.toString() || "";
        break;
      case 5:
        value = record.bloodO2?.toString() || "";
        break;
      case 6:
        value = record.weight?.toString() || "";
        break;
    }

    setEditRecord({
      ...record,
      value, // Add temporary field for UI
    });
    setShowEditPopup(true);
  };

  const handleEditSave = async () => {
    if (!editRecord) return;

    // Validate the edit form
    if (!editRecord.vitalTypeId) {
      alert("請選擇類別");
      return;
    }

    if (editRecord.vitalTypeId === 1 && !editRecord.period) {
      alert("請選擇時段");
      return;
    }

    // Convert create_date to API format
    const dateStr = String(editRecord.create_date);
    const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
    const formattedTime = `${dateStr.slice(8, 10)}:${dateStr.slice(10, 12)}`;

    // Extract the value based on the vitalTypeId
    let value: number | undefined;
    switch (editRecord.vitalTypeId) {
      case 1:
        value = editRecord.bloodSugar;
        break;
      case 2:
        value = editRecord.systolic;
        break;
      case 3:
        value = editRecord.diastolic;
        break;
      case 4:
        value = editRecord.heartRate;
        break;
      case 5:
        value = editRecord.bloodO2;
        break;
      case 6:
        value = editRecord.weight;
        break;
    }

    if (value === undefined) {
      alert("請輸入有效數值");
      return;
    }

    // Prepare record for API
    const updateData = {
      signId: editRecord.signId,
      userId: editRecord.userId,
      patientId: editRecord.patientId,
      vitalTypeId: editRecord.vitalTypeId,
      value,
      recordDateTime: `${formattedDate} ${formattedTime}`,
      comment: editRecord.comment || "",
    };

    // Submit to API
    const success = await updateVitalSign(updateData);
    if (success) {
      // Update the records state
      setRecords(
        records.map((r) => (r.signId === editRecord.signId ? editRecord : r))
      );
      setShowEditPopup(false);
      setEditRecord(null);
    }
  };

  // Helper functions
  const getUnit = (vitalTypeId: number | string): string => {
    return vitalMeta[String(vitalTypeId)]?.unit || "";
  };

  const getDisplayValue = (record: VitalSignRecord): string => {
    switch (record.vitalTypeId) {
      case 1:
        return record.bloodSugar?.toString() || "未知數值";
      case 2:
        return record.systolic?.toString() || "未知數值";
      case 3:
        return record.diastolic?.toString() || "未知數值";
      case 4:
        return record.heartRate?.toString() || "未知數值";
      case 5:
        return record.bloodO2?.toString() || "未知數值";
      case 6:
        return record.weight?.toString() || "未知數值";
      default:
        return "未知數值";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-8 shadow-md">
        <DashboardHeader isCaregiver={isCaregiver} patientName={patientName} />
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          健康紀錄
        </h1>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Add Record Form */}
        <div className="mb-6 p-4 border border-blue-300 rounded-lg bg-blue-50">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-5">
            {/* 選擇類別 */}
            <select
              className="p-2 border rounded font-semibold text-green-600 dark:text-green-600"
              value={newRecord.vitalTypeId}
              onChange={(e) =>
                setNewRecord({
                  ...newRecord,
                  vitalTypeId: e.target.value,
                  value: "",
                  period: "",
                })
              }
            >
              <option value="">選擇類別</option>
              {vitalTypeOptions.map((opt) => (
                <option key={opt.id} value={String(opt.id)}>
                  {opt.name}
                </option>
              ))}
            </select>

            {/* 輸入數值 */}
            <input
              type="number"
              placeholder={
                vitalMeta[newRecord.vitalTypeId]?.placeholder || "✏️輸入數值"
              }
              className="p-2 border rounded font-semibold text-green-600 dark:text-green-600"
              value={newRecord.value}
              onChange={(e) =>
                setNewRecord({ ...newRecord, value: e.target.value })
              }
            />

            {/* 輸入備註 */}
            <input
              type="text"
              placeholder="✏️輸入備註"
              className="p-2 border rounded font-semibold text-green-600 dark:text-green-600 col-span-2"
              value={newRecord.comment}
              onChange={(e) =>
                setNewRecord({ ...newRecord, comment: e.target.value })
              }
            />

            {/* 送出按鈕 */}
            <button
              className="p-2 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition"
              onClick={handleAddRecord}
              disabled={loading}
            >
              {loading ? "處理中..." : "新增"}
            </button>

            {/* 選擇時段（僅在選擇血糖時顯示） */}
            {newRecord.vitalTypeId === "1" && (
              <select
                className="p-2 border rounded font-semibold text-blue-500 dark:text-blue-400"
                value={newRecord.period}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, period: e.target.value })
                }
              >
                <option hidden>選擇時段</option>
                <option value="飯前">飯前</option>
                <option value="飯後">飯後</option>
              </select>
            )}
          </div>
        </div>

        {/* Records List */}
        {loading ? (
          <div className="text-center py-4">載入中...</div>
        ) : (
          <ul className="space-y-4">
            {records.map((record) => (
              <li
                key={record.signId}
                className="p-4 bg-white shadow rounded-lg border border-gray-200 flex justify-between items-center"
              >
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    {idToCategory[String(record.vitalTypeId)] || "未知類別"}
                    {record.vitalTypeId === 1 &&
                      ` - ${record.period || "未知時段"}`}
                    {` ${formatCreateDate(record.create_date)} - ${getDisplayValue(record)} ${getUnit(record.vitalTypeId)}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    備註: {record.comment || "無"}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {/* 編輯icon */}
                  <button onClick={() => openEdit(record)} title="編輯">
                    <Pencil className="w-8 h-8 text-blue-500 hover:text-blue-700" />
                  </button>
                  {/* 刪除icon */}
                  <button
                    onClick={() => confirmDelete(record.signId!)}
                    title="刪除"
                  >
                    <Trash2 className="w-8 h-8 text-red-500 hover:text-red-700" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Delete Confirmation Modal */}
        {showDeletePopup && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <p className="mb-4 text-stone-800">確定要刪除這筆紀錄嗎？</p>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-500 rounded"
                  onClick={() => setShowDeletePopup(false)}
                >
                  取消
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded"
                  onClick={handleDelete}
                >
                  確定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditPopup && editRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h2 className="text-lg text-stone-800 font-bold mb-4">
                編輯紀錄
              </h2>
              <div className="space-y-3">
                {/* 類別 */}
                <select
                  className="text-emerald-800 w-full p-2 border rounded"
                  value={editRecord.vitalTypeId}
                  onChange={(e) => {
                    const newTypeId = Number(e.target.value);
                    setEditRecord({
                      ...editRecord,
                      vitalTypeId: newTypeId,
                      period: "",
                      bloodSugar: undefined,
                      systolic: undefined,
                      diastolic: undefined,
                      heartRate: undefined,
                      bloodO2: undefined,
                      weight: undefined,
                      value: "",
                    });
                  }}
                >
                  <option value="">選擇類別</option>
                  {vitalTypeOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>

                {/* 數值 */}
                {editRecord.vitalTypeId === 1 && (
                  <input
                    type="number"
                    className="text-emerald-800 w-full p-2 border rounded"
                    placeholder={vitalMeta["1"].placeholder}
                    value={editRecord.value || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditRecord({
                        ...editRecord,
                        bloodSugar: value ? Number(value) : undefined,
                        value,
                      });
                    }}
                  />
                )}

                {editRecord.vitalTypeId === 2 && (
                  <input
                    type="number"
                    className="text-emerald-800 w-full p-2 border rounded"
                    placeholder="收縮壓 mmHg"
                    value={editRecord.value || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditRecord({
                        ...editRecord,
                        systolic: value ? Number(value) : undefined,
                        value,
                      });
                    }}
                  />
                )}

                {editRecord.vitalTypeId === 3 && (
                  <input
                    type="number"
                    className="text-emerald-800 w-full p-2 border rounded"
                    placeholder="舒張壓 mmHg"
                    value={editRecord.value || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditRecord({
                        ...editRecord,
                        diastolic: value ? Number(value) : undefined,
                        value,
                      });
                    }}
                  />
                )}

                {editRecord.vitalTypeId === 4 && (
                  <input
                    type="number"
                    className="text-emerald-800 w-full p-2 border rounded"
                    placeholder={vitalMeta["4"].placeholder}
                    value={editRecord.value || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditRecord({
                        ...editRecord,
                        heartRate: value ? Number(value) : undefined,
                        value,
                      });
                    }}
                  />
                )}

                {editRecord.vitalTypeId === 5 && (
                  <input
                    type="number"
                    className="text-emerald-800 w-full p-2 border rounded"
                    placeholder={vitalMeta["5"].placeholder}
                    value={editRecord.value || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditRecord({
                        ...editRecord,
                        bloodO2: value ? Number(value) : undefined,
                        value,
                      });
                    }}
                  />
                )}

                {editRecord.vitalTypeId === 6 && (
                  <input
                    type="number"
                    className="text-emerald-800 w-full p-2 border rounded"
                    placeholder={vitalMeta["6"].placeholder}
                    value={editRecord.value || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditRecord({
                        ...editRecord,
                        weight: value ? Number(value) : undefined,
                        value,
                      });
                    }}
                  />
                )}

                {/* 備註 */}
                <input
                  type="text"
                  className="text-emerald-800 w-full p-2 border rounded"
                  placeholder="✏️輸入備註"
                  value={editRecord.comment}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, comment: e.target.value })
                  }
                />

                {/* 血糖時段 */}
                {editRecord.vitalTypeId === 1 && (
                  <select
                    className="text-emerald-800 w-full p-2 border rounded"
                    value={editRecord.period || ""}
                    onChange={(e) =>
                      setEditRecord({ ...editRecord, period: e.target.value })
                    }
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
                            String(editRecord.create_date).slice(0, 4) +
                              "-" +
                              String(editRecord.create_date).slice(4, 6) +
                              "-" +
                              String(editRecord.create_date).slice(6, 8) +
                              "T" +
                              String(editRecord.create_date).slice(8, 10) +
                              ":" +
                              String(editRecord.create_date).slice(10, 12)
                          )
                        : null
                    }
                    onChange={(newValue) => {
                      if (newValue && dayjs.isDayjs(newValue)) {
                        setEditRecord({
                          ...editRecord,
                          create_date: Number(newValue.format("YYYYMMDDHHmm")),
                        });
                      }
                    }}
                    ampm={false}
                    views={["year", "month", "day", "hours", "minutes"]}
                    format="YYYY/MM/DD HH:mm"
                  />
                </LocalizationProvider>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  className="px-4 py-2 bg-gray-500 rounded"
                  onClick={() => setShowEditPopup(false)}
                >
                  取消
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={handleEditSave}
                >
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
