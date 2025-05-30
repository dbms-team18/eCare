"use client";

import { useState } from "react";
import Button from "../../../components/Button";
import { useRouter } from "next/navigation";
import { BiArrowBack } from "react-icons/bi";
import Link from "next/link";

export default function AddPatientPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [addr, setAddress] = useState("");
  const [idNum, setIdNumber] = useState("");
  const [nhCardNum, setInsuranceNumber] = useState("");
  const [emerName, setEmergencyContact] = useState("");
  const [emerPhone, setEmergencyPhone] = useState("");
  const [info, setNotes] = useState("");
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      name,
      age,
      gender,
      addr,
      idNum,
      nhCardNum,
      emerName,
      emerPhone,
      info,
    });

    // Prepare the patient data to send
    const patientData = {
      name,
      age,
      gender,
      addr,
      idNum,
      nhCardNum,
      emerName,
      emerPhone,
      info,
    };

    try {
      const response = await fetch("http://localhost:3001/api/patient/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(patientData),
      });

      const data = await response.json();

      if (data.success) {
        alert("資料已成功送出");
        router.push("/user/caregiver"); // 送出後跳轉到指定頁面
      } else {
        alert(`錯誤: ${data.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("資料送出失敗");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#d6f5f0] px-4">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ←返回 + 標題 */}
          <div className="flex items-center gap-2 mb-4 text-gray-800">
            <Link
              href="/user/caregiver"
              className="text-gray-600 hover:text-black text-2xl"
            >
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
                    checked={gender === "男"}
                    onChange={() => setGender("男")}
                  />
                  男
                </label>
                <label className="flex items-center gap-1 text-gray-900">
                  <input
                    type="radio"
                    value="女"
                    checked={gender === "女"}
                    onChange={() => setGender("女")}
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
                value={idNum}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700">健保卡號</label>
              <input
                type="text"
                value={nhCardNum}
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
                value={emerName}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700">緊急聯絡電話</label>
              <input
                type="text"
                value={emerPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900"
              />
            </div>
          </div>

          {/* 備註 */}
          <div>
            <label className="block text-gray-700">備註</label>
            <textarea
              value={info}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded  text-gray-900 resize-none"
              rows={3}
            />
          </div>

          <div className="pt-2">
            <Button label="確認送出" className="w-full" onClick={() => {}} />
          </div>
        </form>
      </div>
    </div>
  );
}
