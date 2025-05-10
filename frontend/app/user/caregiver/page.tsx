'use client'

// app/user/profile/page.tsx
import Button from '../../../components/Button'
import UserInfoHeader from '../../../components/UserInfoHeader'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { BiUser, BiPlus, BiArrowBack } from 'react-icons/bi'

export default function ProfilePage() {
    const router = useRouter()
    const patients = [
        { id: '1', name: '王小明', idNumber: 'F229123456', age: 70 },
        { id: '2', name: '李阿姨', idNumber: 'F229654321', age: 83 },
      ]
    const [selectedId, setSelectedId] = useState('')

    const handleSubmit = () => {
        const selected = patients.find((p) => p.id === selectedId)
        if (selected) {
            localStorage.setItem('currentPatient', JSON.stringify(selected)) // 先暫存
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
              <Link href="/" className="text-gray-600 hover:text-black text-2xl">
                <BiArrowBack />
              </Link>
              <h2 className="text-2xl font-bold">請選擇您要管理的個案</h2>
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
                    checked={selectedId === p.id}
                    onChange={() => setSelectedId(p.id)}
                    className="accent-blue-500"
                  />
                  <div>
                    <div className="flex items-center gap-2 text-gray-900">
                      <BiUser />
                      <span className="font-semibold">{p.name}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      身分證：{p.idNumber.slice(-4)}｜年齡：{p.age}
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
  