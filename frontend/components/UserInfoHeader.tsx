'use client'

import { useState } from 'react'
import { BiUserCircle } from 'react-icons/bi'

export default function UserInfoHeader() {
  const [showPopup, setShowPopup] = useState(false)

  const user = {
    username: '123',
    email: 'happy@gmail.com',
    role: '照顧者',
  }

  return (
    <div className="w-full bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-800">eCare連心長照系統</h1>

      <div className="relative">
        <div
          onClick={() => setShowPopup(!showPopup)}
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-3 py-1 rounded-lg transition"
        >
          <BiUserCircle className="text-3xl text-gray-700" />
          <span className="text-gray-800 font-medium">{user.username}</span>
        </div>

        {showPopup && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-md p-4 text-sm text-gray-700 z-50">
            <p className="mb-1"><span className="font-medium">帳號：</span>{user.username}</p>
            <p className="mb-1"><span className="font-medium">身分：</span>{user.role}</p>
            <p><span className="font-medium">信箱：</span>{user.email}</p>
          </div>
        )}
      </div>
    </div>
  )
}
