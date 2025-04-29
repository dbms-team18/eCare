import mysqlConnectionPool from "../../lib/mysql"; // 引入 MySQL 連接池
import { NextApiRequest, NextApiResponse } from "next";
import { ResultSetHeader } from "mysql2"; // 引入 ResultSetHeader 類型

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
    // 獲取 MySQL 連接
    const connection = await mysqlConnectionPool.getConnection();

    // 執行刪除操作
    const [result]: [ResultSetHeader] = await connection.execute(
      `DELETE FROM vitalsigns WHERE signId = ?`,
      [signId]
    );

    // 如果沒有刪除的行，返回 404 錯誤
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, err: "未找到對應的生理資料" });
    }

    // 刪除成功後返回訊息
    return res.status(200).json({
      success: true,
      message: "生理資料刪除成功",
    });
  } catch (err: any) {
    // 捕獲異常，並返回錯誤訊息
    const errorMessage = err instanceof Error ? err.message : "未知錯誤";
    return res.status(500).json({
      success: false,
      err: `內部錯誤: ${errorMessage}`,
    });
  }
};
