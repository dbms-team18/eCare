import React from "react";

type PatientInfoProps = {
  alertTriggered: boolean;
};

const PatientInfo: React.FC<PatientInfoProps> = ({ alertTriggered }) => {
  // const message = alertTriggered ? "請查看健康警示" : "繼續保持！";
  const message = "請記得每日記錄喔！";
  return (
    <div className="col-span-3">
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
        <p className="text-gray-500 text-center text-lg">{message}</p>
      </div>
      <div className="flex justify-center">
        <img
          src={alertTriggered ? "/alert-image.svg" : "/patient-cartoon.svg"}
          alt="Patient illustration"
          className="w-full max-w-[250px]"
          onError={(e) => {
            e.currentTarget.src = alertTriggered
              ? "https://placehold.co/250x250?text=Alert+Image"
              : "https://placehold.co/250x250?text=Patient+Illustration";
          }}
        />
      </div>
    </div>
  );
};

export default PatientInfo;
