'use client'

import { useState, useEffect } from 'react'
import Button from '../../../components/Button'
import { useRouter } from 'next/navigation'
import { BiArrowBack } from 'react-icons/bi'
import Link from 'next/link'
import { RowDataPacket } from 'mysql2';
import { useSearchParams } from 'next/navigation';


// import PatientInfo from '@/components/dashboard/PatientInfo'
import {useUser} from '@/contexts/DashboardUserContext'

export default function EditPatientPage() {
  const router = useRouter()

/*
  1. 用 get api 拿 patient 資料
  2. 將資料放置到欄位
  3. 從欄位取出新資料
  4. 用 update api 傳新的 patient 資料 
*/


// 定義要準備回傳的 PatientInfo
interface PatientRow extends RowDataPacket {
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
  lastUpdId: number;
  userId: number;
}

// 表格欄位
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [addr, setAddr] = useState('')
  const [idNum, setIdNum] = useState('')
  const [nhCardNum, setnhCardNum] = useState('')
  const [emerName, setemerName] = useState('')
  const [emerPhone, setemerPhone] = useState('')
  const [info, setinfo] = useState('')  



// 使用 get api 需要的參數
const {userId} = useUser()
const searchParams = useSearchParams();
const patientIdRaw = searchParams.get('patientId');
const patientId = patientIdRaw ? parseInt(patientIdRaw, 10) : undefined;

// 抓取選取的病患資料
useEffect(() => {
    if (!userId || !patientId) return;

    const fetchPatientInfo = async () => {
    try {
    const params = new URLSearchParams({
      userId: userId.toString(),
      patientId: patientId.toString(),
    });

    const res = await fetch(`http://localhost:3001/api/patient/get?${params.toString()}`, {
      method: 'GET',
      credentials: 'include', // 如果要帶 cookie
    });

    const result = await res.json();

    if (result.success && result.data) {
      const patient = result.data;
      setName(patient.name);
      setAge(patient.age.toString());
      setGender(patient.gender);
      setAddr(patient.addr);
      setIdNum(patient.idNum);
      setnhCardNum(patient.nhCardNum);
      setemerName(patient.emerName);
      setemerPhone(patient.emerPhone);
      setinfo(patient.info);
      console.log('成功回傳:', result);
    } else {
      console.warn('病患資料格式錯誤，送出的參數為：', { userId, patientId }, 'API 回傳：', result);
      setName('');
    }
  } catch (err) {
    console.error('病患資料取得失敗:', err);
  }
};


    fetchPatientInfo();
  }, [userId, patientId]);


  // 確認修改後送出
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:3001/api/patient/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          patientId,
          userId,
          name, 
          age, 
          gender, 
          addr,
          idNum, 
          nhCardNum,
          emerName, 
          emerPhone, 
          info }),
});
    const data = await response.json();
    console.log(response)

    // 後端回傳問題
    if (!response.ok) {
      alert(data.message);
      return;
    }

  } catch (err) {
    console.error('無法修改資料:', err);
    alert('修改失敗');
  }
    // 成功回傳
    alert('資料已修改')
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
            <h2 className="text-2xl font-bold">修改病患資料</h2>
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
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900"
            />
          </div>

          {/* 身分證 & 健保卡 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-700">身分證字號</label>
              <input
                type="text"
                value={idNum}
                onChange={(e) => setIdNum(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700">健保卡號</label>
              <input
                type="text"
                value={nhCardNum}
                onChange={(e) => setnhCardNum(e.target.value)}
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
                value={emerName}
                onChange={(e) => setemerName(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700">緊急聯絡電話</label>
              <input
                type="text"
                value={emerPhone}
                onChange={(e) => setemerPhone(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900"
              />
            </div>
          </div>

          {/* 備註 */}
          <div>
            <label className="block text-gray-700">備註</label>
            <textarea
              value={info}
              onChange={(e) => setinfo(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded  text-gray-900 resize-none"
              rows={3}
            />
          </div>

          {/* 送出按鈕 */}
          <div className="pt-2">
            <Button 
            label="確認修改" 
            className="w-full" 
            onClick={handleSubmit}/>
          </div>

        </form>
      </div>
    </div>
  )

}