'use client'

// app/user/profile/page.tsx
import Button from '../../../components/Button'
import UserInfoHeader from '../../../components/UserInfoHeader'
import { useRouter } from 'next/navigation'
import { useEffect,useState } from 'react'

import { BiUser, BiPlus,  } from 'react-icons/bi'

interface Patient {
  id: number
  name: string
  idNum: string
  age: number
}

export default function Caregiver() {
    const router = useRouter()
    const [patients, setPatients] = useState<Patient[]>([])
    const [selectedId, setSelectedId] = useState('')

    useEffect(() => {
      fetch('backend/pages/api/patient/getAll', {
        credentials: 'include' // ✅ 務必加這行，才能送出 cookie
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPatients(data.data)
          } else {
            alert(data.message || '病患資料載入失敗')
          }
        })
        .catch((err) => {
          console.error('錯誤:', err)
          alert('連線失敗')
        })
    }, [])


    /*useEffect(() => {
      fetch('/api/User/getUser', {
        credentials: 'include', // 一定要加，才會帶上 cookie
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success || !data.user) {
            alert('尚未登入或使用者資訊錯誤')
            router.push('/user/login')
            return
          }

          const userId = data.user.userId // 假設 API 回傳有 userId（你可加在組員的 API 裡）
          // 或者你可以手動記到 state（若 API 沒回傳 userId 就不能接 getAll）
          fetch(`/api/patient/get?userId=${userId}`)
            .then((res) => res.json())
            .then((patientData) => {
              if (patientData.success) {
                setPatients(patientData.data)
              } else {
                alert(patientData.message || '病患資料載入失敗')
              }
            })
        })
        .catch((err) => {
          console.error(err)
          alert('發生錯誤，請稍後再試')
        })
    }, [])*/

    const handleSubmit = () => {
      const selected = patients.find((p) => String(p.id) === selectedId)
      if (selected) {
        localStorage.setItem('currentPatient', JSON.stringify(selected))
        alert(`已切換至個案：${selected.name}`)
      } else {
        alert('請先選擇一位個案')
      }
    }


    return (
      <div>
        <UserInfoHeader />
        
        <div className="relative min-h-screen flex items-center justify-center bg-[#d6f5f0] px-4">
      
          {/* 🔹 主卡片內容 🔹 */}
          <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
            
            {/* 返回箭頭 + 標題 */}
            <div className="flex items-center gap-2 mb-6 text-gray-800">
              
              <h2 className="text-2xl font-bold text-center">請選擇您要管理的個案</h2>
            </div>

            {/* 個案列表 */}
            <div className="space-y-4 mb-6">
              {patients.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 border border-gray-300 rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition-all"
                >
                  <input
                    type="radio"
                    name="selectedPatient"
                    value={p.id}
                    checked={selectedId === String(p.id)}
                    onChange={() => setSelectedId(String(p.id))}
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
                label="新增病患"
                icon={BiPlus}
                className="w-full"
                onClick={() => router.push('/patient/add')}
              />
              <Button
                label="確認切換"
                
                className="w-full"
                onClick={handleSubmit}
              />
              
            </div>
          </div>
        </div>

          </div>
      
    )
  }
  