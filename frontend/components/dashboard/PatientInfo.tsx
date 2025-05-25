import React from "react";

type PatientInfoProps = {
  message: string;
  alertTriggered: boolean; // 新增屬性
  patient: {
    name: string;
    // 可以根據需要添加更多屬性
  };
};

const PatientInfo: React.FC<PatientInfoProps> = ({
  message,
  alertTriggered,
  patient,
}) => {
  return (
    <div className="col-span-3">
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
        <p className="text-gray-500 text-center text-lg">{message}</p>
        <p className="text-center text-gray-800">
          病患名稱：{patient.name}
        </p>{" "}
        {/* 顯示病患名稱 */}
      </div>
      <div className="flex justify-center">
        <img
          src={alertTriggered ? "/alert-image.svg" : "/patient-cartoon.svg"}
          alt="Patient illustration"
          className="w-full max-w-[250px]"
        />
      </div>
    </div>
  );
};

export default PatientInfo;

{
  /* <PatientInfo
  message="繼續保持！"
  alertTriggered={true} // 傳入是否觸發警報
/>; */
}
// 定義 patient 物件
