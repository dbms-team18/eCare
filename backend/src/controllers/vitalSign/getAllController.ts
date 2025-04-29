import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export const getAllVitalSigns = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, err: "Method Not Allowed" });
  }
  const userId = parseInt(req.query.userId as string, 10); // 轉換為整數型態
  if (isNaN(userId)) {
    return res
      .status(400)
      .json({ success: false, err: "userId 必須是有效的數字" });
  }

  try {
    // 查詢該用戶管理的所有生理資料
    const vitalSigns = await prisma.vitalSign.findMany({
      where: {
        userId: userId, // 確保 userId 是字符串型態，符合資料庫的型態
      },
    });

    if (vitalSigns.length === 0) {
      return res
        .status(404)
        .json({ success: false, err: "未找到任何生理資料" });
    }

    return res.status(200).json({ success: true, vitalSigns });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "未知錯誤";
    return res
      .status(500)
      .json({ success: false, err: `內部錯誤: ${errorMessage}` });
  }
};
