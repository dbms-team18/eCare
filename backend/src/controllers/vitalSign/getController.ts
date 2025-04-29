import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export const getVitalSign = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const {
    query: { signId },
    method,
  } = req;

  if (method !== "GET") {
    return res.status(405).json({ success: false, err: "Method Not Allowed" });
  }

  if (!signId || Array.isArray(signId)) {
    return res
      .status(400)
      .json({ success: false, err: "缺少 signId 參數或參數不正確" });
  }

  const parsedSignId = parseInt(signId, 10); // 轉換為整數

  if (isNaN(parsedSignId)) {
    return res
      .status(400)
      .json({ success: false, err: "signId 必須是有效的數字" });
  }

  try {
    // 查詢單一生理資料
    const vitalSign = await prisma.vitalSign.findUnique({
      where: {
        signId: parsedSignId, // 使用正確的 signId 進行查詢
      },
    });

    if (!vitalSign) {
      return res.status(404).json({ success: false, err: "未找到生理資料" });
    }

    return res.status(200).json({ success: true, vitalSign });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "未知錯誤";
    return res
      .status(500)
      .json({ success: false, err: `內部錯誤: ${errorMessage}` });
  }
};
