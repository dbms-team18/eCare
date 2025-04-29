import mysqlConnectionPool from "../../lib/mysql"; // 引入 mysql 連接池
import { NextApiRequest, NextApiResponse } from "next";
import { ResultSetHeader } from "mysql2"; // 引入 ResultSetHeader 類型

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
    // 獲取 MySQL 連接
    const connection = await mysqlConnectionPool.getConnection();

    // 更新生理資料
    const [result]: [ResultSetHeader, any] = await connection.execute(
      `
      UPDATE vitalsigns 
      SET 
        userId = ?, 
        patientId = ?, 
        vitalTypeId = ?, 
        value = ?, 
        recordDateTime = ?, 
        comment = ?, 
        alertTrigged = ?
      WHERE signId = ?`,
      [
        userId,
        patientId,
        vitalTypeId,
        value,
        recordDateTime,
        comment,
        value > 180 ? true : false, // 若數值過高則觸發警報
        signId,
      ]
    );

    // 釋放連接池
    connection.release();

    // 如果沒有更新的行，返回 404
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, err: "未找到對應的資料" });
    }

    return res.status(200).json({
      success: true,
      message: "生理資料更新成功",
      signId: signId,
      alertTriggered: value > 180 ? true : false, // 返回警報觸發狀態
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "未知錯誤";
    return res.status(500).json({
      success: false,
      err: `內部錯誤: ${errorMessage}`,
    });
  }
};
