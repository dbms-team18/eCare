'use client'

import { useState } from 'react'
import LoginRegisterCard from '../../../components/LoginRegisterCard'
import Button from '../../../components/Button'
import Link from 'next/link';
import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/DashboardUserContext';



//import Button from 'app/components/Button'

export default function LoginPage() {
  const { setRole, setUser } = useUser();
  //const [email, setEmail] = useState('')
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('')
  const [role, setLocalRole] = useState('')
  const router = useRouter() //假裝先登入

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    //console.log('email:', username)
    //console.log('password:', password)
    
    if (!username || !password || !role) {
    alert('請填寫所有欄位');
    return;
  }

  try {
    const response = await fetch('http://localhost:3001/api/User/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role: parseInt(role, 10) }),
      credentials: 'include', // 傳 cookie
});

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    // 根據回傳 role 導向不同畫面
    if (data.role === 0) {
      router.push('/user/caregiver');
    } else {
      router.push('/user/family');
    }
    // 寫 local storge
    localStorage.setItem('uid', JSON.stringify(data.uid));
    localStorage.setItem('currentRole', JSON.stringify(data.role)) // 先暫存
    setRole(data.role); 
    setUser(data.uid); 



  } catch (err) {
    console.error('登入錯誤:', err);
    alert('登入失敗，請稍後再試');
  }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#d6f5f0] px-4">
    <LoginRegisterCard
      title="登入帳號"
      subtitle="請輸入帳號與密碼"
      footer={<p>還沒有帳號？
        <Link href="/user/signup" className="text-blue-500 hover:underline">註冊</Link>
      </p>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="使用者帳號"
          className="w-full border border-gray-300 px-4 py-2 rounded text-gray-700 placeholder-gray-500"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密碼"
          className="w-full border border-gray-300 px-4 py-2 rounded text-gray-700 placeholder-gray-500"
          required
        />
        {/* 身分別選擇 */}
        <select
            value={role}
            onChange={(e) => setLocalRole(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded text-gray-700 text-left placeholder-gray-500 appearance-none"
            required
          >
            <option value="" disabled hidden>
            請選擇身分別
            </option>
            <option value="0">照顧者</option>
            <option value="1">家屬</option>
        </select>
        <Button label="登入" type="submit" className="w-full" />

      

      </form>
    </LoginRegisterCard>
  </div>
  )
}
