"use client";

import { useEffect, useState } from "react";
import { BiUserCircle, BiLogOut } from "react-icons/bi";
import { useRouter } from "next/navigation";

interface UserInfo {
  username: string;
  email: string;
  role: number;
}

export default function UserInfoHeader() {
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const router = useRouter();

  // 抓取 user 資訊
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/User/getUser", {
          credentials: "include", // 攜帶 cookie
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
        } else {
          console.error("抓取使用者失敗:", data.message);
        }
      } catch (err) {
        console.error("請求錯誤:", err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("uid");
      localStorage.removeItem("currentRole");
      const res = await fetch("http://localhost:3001/api/User/logout", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        alert("登出成功");
        router.push("/");
      } else {
        alert(data.message || "登出失敗");
      }
    } catch (err) {
      console.error("登出錯誤:", err);
      alert("登出失敗，請稍後再試");
    }
  };

  return (
    <div className="w-full bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-gray-800">eCare連心長照系統</h1>

      {user && (
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
              <p className="mb-1">
                <span className="font-medium">帳號：</span>
                {user.username}
              </p>
              <p className="mb-1">
                <span className="font-medium">身分：</span>
                {user.role === 0 ? "照顧者" : "家屬"}
              </p>
              <p className="mb-3">
                <span className="font-medium">信箱：</span>
                {user.email}
              </p>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 transition w-full justify-center"
              >
                <BiLogOut className="text-lg" />
                登出
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
