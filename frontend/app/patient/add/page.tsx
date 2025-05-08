'use client'

import { useState } from 'react'
import Button from '../../../components/Button'
import { useRouter } from 'next/navigation'
import { BiArrowBack } from 'react-icons/bi'
import Link from 'next/link'

export default function AddPatientPage() {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [address, setAddress] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [insuranceNumber, setInsuranceNumber] = useState('')
  const [emergencyContact, setEmergencyContact] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [notes, setNotes] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({
      name, age, gender, address,
      idNumber, insuranceNumber,
      emergencyContact, emergencyPhone, notes
    })
    alert('資料已送出（模擬）')
    setTimeout(() => {
        router.push('/user/caregiver')
      }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#d6f5f0] px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
    
        {/* ←返回 + 標題 */}
        <div className="flex items-center gap-2 mb-4 text-gray-800">
          <Link href="/user/caregiver" className="text-gray-600 hover:text-black text-2xl">
            <BiArrowBack />
          </Link>
          <h2 className="text-2xl font-bold">輸入病患資料</h2>
        </div>

          {/* 姓名、年齡、性別 */}
          <div className="flex flex-wrap gap-4">

            <div className="flex-1">
              <label className="block text-gray-700">姓名</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900"
                required
              />
            </div>
            <div className="w-24">
              <label className="block text-gray-700">年齡</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">性別</label>
              <div className="flex gap-2 mt-1">
                <label className="flex items-center gap-1 text-gray-900">
                  <input
                    type="radio"
                    value="男"
                    checked={gender === '男'}
                    onChange={() => setGender('男')}
                  />
                  男
                </label>
                <label className="flex items-center gap-1 text-gray-900">
                  <input
                    type="radio"
                    value="女"
                    checked={gender === '女'}
                    onChange={() => setGender('女')}
                  />
                  女
                </label>
              </div>
            </div>
          </div>

          {/* 地址 */}
          <div>
            <label className="block text-gray-700">地址</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900"
            />
          </div>

          {/* 身分證 & 健保卡 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-700">身分證字號</label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700">健保卡號</label>
              <input
                type="text"
                value={insuranceNumber}
                onChange={(e) => setInsuranceNumber(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900"
              />
            </div>
          </div>

          {/* 緊急聯絡 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-700">緊急聯絡人</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700">緊急聯絡電話</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900"
              />
            </div>
          </div>

          {/* 備註 */}
          <div>
            <label className="block text-gray-700">備註</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded  text-gray-900 resize-none"
              rows={3}
            />
          </div>

          <div className="pt-2">
            <Button label="確認送出" className="w-full" onClick={() => {}}/>
          </div>

        </form>
      </div>
    </div>
  )
}
