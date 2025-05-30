'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import UserInfoHeader from '../../../components/UserInfoHeader'
import Button from '../../../components/Button'
import {useUser} from '@/contexts/DashboardUserContext'

export default function BindPatientPage() {
  const [idNum, setIdNumber] = useState('')
  const [bindResult, setBindResult] = useState<'success' | 'fail' | null>(null)
  const router = useRouter();
  const {userId} = useUser();

  const handleVerify = async () => {

    if (!idNum) {
      alert('請輸入病患身分證字號')
      return
    }
    
    try {
    const response = await fetch('http://localhost:3001/api/patient/bind', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 後端驗證 cookie
      body: JSON.stringify({
        idNum,
        userId, 
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      setBindResult('fail');
      return;
    }

    setBindResult('success')
  } catch (err) {
    console.error('綁定請求失敗:', err);
    setBindResult('fail')
    alert('發送綁定請求時發生錯誤');
  }
  }

  return (
    <>
      <UserInfoHeader />

      <div className="bg-[#d6f5f0] min-h-screen flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            請輸入病患身分證字號以供驗證綁定
          </h2>

          <div className="mb-6 text-left">
            <label className="block mb-2 text-gray-700">病患身分證字號:</label>
            <input
              type="text"
              value={idNum}
              onChange={(e) => setIdNumber(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="請輸入病患身分證字號"
            />
          </div>

          <Button label="綁定驗證" className="w-full" onClick={handleVerify} />
        </div>
      </div>

      {/* 彈窗區塊 */}
      {bindResult && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-gray-300 rounded-xl shadow-lg w-full max-w-xs">
            {/* 彈窗內容 */}
            <div className="p-6 text-center">
              {bindResult === 'success' ? (
                <>
                  <h2 className="text-lg font-bold text-gray-800 mb-2">驗證成功!!!</h2>
                  <p className="text-gray-700 mb-6">已新增病患</p>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-gray-800 mb-2">驗證失敗</h2>
                  <p className="text-gray-700 mb-6">此身分證字號無法綁定病患</p>
                </>
              )}
                <Button
                    label = "返回"
                    onClick={() => router.push('/user/family')}
                    className="w-full border-2 border-[#1E40AF] text-[#1E40AF] hover:bg-[#1E40AF] hover:text-[#1E40AF]"
                />

            </div>
          </div>
        </div>
      )}
    </>
  )
}
