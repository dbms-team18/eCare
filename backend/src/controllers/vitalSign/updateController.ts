import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export const updateVitalSign = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  if (req.method !== "PUT") {
    return res.status(405).json({ success: false, err: "Method Not Allowed" });
  }

  const {
    signId,
    userId,
    patientId,
    vitalTypeId,
    value,
    recordDateTime,
    comment,
  } = req.body;

  // 檢查必要欄位
  if (
    !signId ||
    !userId ||
    !patientId ||
    !vitalTypeId ||
    !recordDateTime ||
    value === undefined
  ) {
    return res.status(400).json({ success: false, err: "缺少必要欄位" });
  }

  try {
    // 更新生理資料
    const updatedVitalSign = await prisma.vitalSign.update({
      where: { signId },
      data: {
        userId,
        patientId,
        vitalTypeId,
        value, // 測量值（例如血糖、血壓等）
        recordDateTime: new Date(recordDateTime), // 測量時間
        comment, // 備註
        alertTrigged: value > 180 ? true : false, // 若數值過高則觸發警報
      },
    });

    return res.status(200).json({
      success: true,
      message: "生理資料更新成功",
      signId: updatedVitalSign.signId,
      alertTriggered: updatedVitalSign.alertTrigged, // 返回警報觸發狀態
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "未知錯誤";
    return res.status(500).json({
      success: false,
      err: `內部錯誤: ${errorMessage}`,
    });
  }
};
