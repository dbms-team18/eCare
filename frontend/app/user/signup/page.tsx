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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 這裡可以寫送出資料到後端的邏輯
    if (!username || !password || !email || role === '') {
      alert('請填寫完整資訊');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/User/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          email,
          role: parseInt(role, 10), // 傳成 number
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || '註冊失敗');
        return;
      }

      alert('註冊成功');
      router.push('/user/login');
    } catch (error) {
      console.error('註冊錯誤:', error);
      alert('註冊失敗，請稍後再試');
    }
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
            <option value="0">照顧者</option>
            <option value="1">家屬</option>
          </select>

          <Button label="註冊" onClick={() => {}} className="w-full" />
        </form>
      </LoginRegisterCard>
    </div>
  );
}
