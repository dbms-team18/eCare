import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export const createVitalSign = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, err: "Method Not Allowed" });
  }

  const {
    userId,
    patientId,
    typeId,
    bloodSugar,
    systolic,
    diastolic,
    bloodO2,
    heartRate,
    create_date,
    time,
    comment,
  } = req.body;

  // 檢查必要欄位
  if (!userId || !patientId || !typeId || !create_date || !time) {
    return res.status(400).json({ success: false, err: "缺少必要欄位" });
  }

  const vitalSignData: any = {};
  // 使用 let 因為後面還會賦值
  // 根據 typeId 決定要儲存的生理資料
  switch (typeId) {
    case 1: // bloodSugar
      if (bloodSugar !== undefined) {
        vitalSignData.value = bloodSugar;
      }
      break;
    case 2: // systolic
      if (systolic !== undefined) {
        vitalSignData.value = systolic;
      }
      break;
    case 3: // diastolic
      if (diastolic !== undefined) {
        vitalSignData.value = diastolic;
      }
      break;
    case 4: // bloodO2
      if (bloodO2 !== undefined) {
        vitalSignData.value = bloodO2;
      }
      break;
    case 5: // heartRate
      if (heartRate !== undefined) {
        vitalSignData.value = heartRate;
      }
      break;
    default:
      return res.status(400).json({ success: false, err: "無效的 typeId" });
  }

  // 儲存 vital sign 資料
  try {
    const newVitalSign = await prisma.vitalSign.create({
      data: {
        userId,
        patientId,
        vitalTypeId: typeId, // 對應到 vitalTypeId
        value: vitalSignData.value, // 根據 typeId 儲存相應的數值
        recordDateTime: new Date(create_date), // 儲存時間
        time,
        comment,
        alertTrigged: false, // 預設不觸發警報
      },
    });

    return res.status(200).json({
      success: true,
      message: "生理資料創建成功",
      signId: newVitalSign.signId,
      alertTriggered: false, // 初始為不觸發警報
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "未知的錯誤";
    return res.status(500).json({
      success: false,
      err: `內部錯誤: ${errorMessage}`,
    });
  }
};
