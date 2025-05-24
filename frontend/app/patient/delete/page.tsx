'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

// TypeScript interface for patient data
interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  addr: string;
  idNum: string;
  nhCardNum: string;
  emerName: string;
  emerPhone: string;
  info: string;
  isArchived: boolean;
  lastUpd: string;
  userId: number;
}

export default function PatientDeletePage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal/popup states (following VitalSign pattern)
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showArchivePopup, setShowArchivePopup] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<number | null>(null);
  const [patientToArchive, setPatientToArchive] = useState<number | null>(null);

  // Function to get all patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/patient/getAll');
      const result = await response.json();
      
      if (result.success) {
        setPatients(result.data);
      } else {
        setError(result.message || '獲取病患列表失敗');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // Archive patient function 
  const archivePatient = async (patientId: number) => {
    try {
      const response = await fetch('/api/patient/status', { //連到負責刪除的後端status.ts
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patientId,
          isArchived: true
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update the patient in the list
        setPatients(patients.map(p => 
          p.id === patientId ? { ...p, isArchived: true } : p
        ));
        return true;
      } else {
        setError(result.message || '封存失敗');
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      setError('網路錯誤，請稍後再試');
      return false;
    }
  };

  // Delete patient 
  const deletePatient = async (patientId: number) => {
    try {
      const response = await fetch('/api/patient/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: patientId,
          isArchived: false
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Remove patient from the list
        setPatients(patients.filter(p => p.id !== patientId));
        return true;
      } else {
        setError(result.message || '刪除失敗');
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      setError('網路錯誤，請稍後再試');
      return false;
    }
  };

  // Confirmation handlers
  const confirmArchive = (patientId: number) => {
    setPatientToArchive(patientId);
    setShowArchivePopup(true);
  };

  const confirmDelete = (patientId: number) => {
    setPatientToDelete(patientId);
    setShowDeletePopup(true);
  };

  const handleArchive = async () => {
    if (!patientToArchive) return;

    const success = await archivePatient(patientToArchive);
    if (success) {
      setShowArchivePopup(false);
      setPatientToArchive(null);
    }
  };

  const handleDelete = async () => {
    if (!patientToDelete) return;

    const success = await deletePatient(patientToDelete);
    if (success) {
      setShowDeletePopup(false);
      setPatientToDelete(null);
    }
  };

  // Load patients when component mounts...
  useEffect(() => {
    fetchPatients();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center py-4">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-yellow-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-8 shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          病患管理
        </h1>
        
        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {patients.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <p className="text-gray-600">目前沒有病患資料</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {patients.map(patient => (
              <li
                key={patient.id}
                className="p-4 bg-white shadow rounded-lg border border-gray-200 flex justify-between items-center"
              >
                <div className="flex-1">
                  <p className="text-lg font-bold text-gray-800">
                    {patient.name} - {patient.age}歲 ({patient.gender})
                  </p>
                  <p className="text-sm text-gray-600">地址: {patient.addr}</p>
                  <p className="text-sm text-gray-600">身分證: {patient.idNum}</p>
                  <p className="text-sm text-gray-500">
                    備註: {patient.info || "無"}
                  </p>
                  {patient.isArchived && (
                    <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm mt-1">
                      已封存
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {/* Archive button (only show if not already archived) */}
                  {!patient.isArchived && (
                    <button 
                      onClick={() => confirmArchive(patient.id)}
                      title="封存"
                      className="p-2 text-yellow-500 hover:text-yellow-700 transition"
                    >
                      <Pencil className="w-6 h-6" />
                    </button>
                  )}
                  
                  {/* Delete button */}
                  <button
                    onClick={() => confirmDelete(patient.id)}
                    title="刪除"
                    className="p-2 text-red-500 hover:text-red-700 transition"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Archive Confirmation */}
        {showArchivePopup && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full mx-4">
              <p className="mb-4 text-stone-800">確定要封存這位病患嗎？</p>
              <p className="mb-4 text-sm text-gray-600">封存後病患資料仍會保留，但會標記為已封存狀態。</p>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                  onClick={() => setShowArchivePopup(false)}
                >
                  取消
                </button>
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                  onClick={handleArchive}
                >
                  確定封存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeletePopup && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full mx-4">
              <p className="mb-4 text-stone-800">確定要永久刪除這位病患嗎？</p>
              <p className="mb-4 text-sm text-red-600">此操作無法復原！病患的所有資料都會被永久刪除。</p>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                  onClick={() => setShowDeletePopup(false)}
                >
                  取消
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  onClick={handleDelete}
                >
                  確定刪除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}