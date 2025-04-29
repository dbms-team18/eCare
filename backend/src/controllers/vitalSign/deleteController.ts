import { prisma } from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export const deleteVitalSign = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, err: "Method Not Allowed" });
  }

  const { signId } = req.body;

  // 檢查是否傳入 signId
  if (!signId) {
    return res.status(400).json({ success: false, err: "缺少 signId 參數" });
  }

  try {
    // 刪除生理資料
    await prisma.vitalSign.delete({
      where: {
        signId: signId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "生理資料刪除成功",
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "未知的錯誤";
    return res
      .status(500)
      .json({ success: false, err: `內部錯誤: ${errorMessage}` });
  }
};
