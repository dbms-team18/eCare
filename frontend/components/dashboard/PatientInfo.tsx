import React from 'react';

type PatientInfoProps = {
  message: string;
  alertTriggered: boolean; // 新增屬性
};

const PatientInfo: React.FC<PatientInfoProps> = ({ message, alertTriggered }) => {
  return (
    <div className="col-span-3">
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
        <p className="text-gray-500 text-center text-lg">{message}</p>
      </div>
      <div className="flex justify-center">
        <img
          src={alertTriggered ? "/alert-image.svg" : "/patient-cartoon.svg"} // 根據 alertTriggered 切換圖片
          alt="Patient illustration"
          className="w-full max-w-[250px]"
          onError={(e) => {
            e.currentTarget.src = alertTriggered
              ? 'https://placehold.co/250x250?text=Alert+Image'
              : 'https://placehold.co/250x250?text=Patient+Illustration';
          }}
        />
      </div>
    </div>
  );
};

export default PatientInfo;

<PatientInfo
  message="繼續保持！"
  alertTriggered={true} // 傳入是否觸發警報
/>