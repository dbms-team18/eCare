'use client'

import { useState } from 'react';
import LoginRegisterCard from '../../../components/LoginRegisterCard'
import Link from 'next/link'; // 引入 Link
import Button from '../../../components/Button';
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 這裡可以寫送出資料到後端的邏輯
    if (username && password) {
      // 註冊成功，導回主畫面
      router.push('/')
    } else {
      alert('請填寫完整資訊')
    }

    console.log('註冊資訊', { username, password, email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#d6f5f0] px-4">
      <LoginRegisterCard
        title="註冊新帳號"
        subtitle="請輸入帳號、密碼與電子郵件"
        footer={
          <p>
            已有帳號？
            <Link href="/user/login" className="text-blue-500 hover:underline">
              返回登入
            </Link>
          </p>
        }
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
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="電子郵件"
            className="w-full border border-gray-300 px-4 py-2 rounded text-gray-700 placeholder-gray-500"
            required
          />
          {/* 身分別選擇 */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded text-gray-700 text-left placeholder-gray-500 appearance-none"
            required
          >
            <option value="" disabled hidden>
            請選擇身分別
            </option>
            <option value="caregiver">照顧者</option>
            <option value="family">家屬</option>
          </select>

          <Button label="註冊" onClick={() => {}} className="w-full" />
        </form>
      </LoginRegisterCard>
    </div>
  );
}
