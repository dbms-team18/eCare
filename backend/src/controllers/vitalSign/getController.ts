import mysqlConnectionPool from "../../lib/mysql"; // 引入 mysql 連接池
import { NextApiRequest, NextApiResponse } from "next";
import { ResultSetHeader, RowDataPacket } from "mysql2"; // 引入 ResultSetHeader 和 RowDataPacket 類型

export const getVitalSign = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const {
    query: { signId },
    method,
  } = req;

  // 只允許 GET 請求
  if (method !== "GET") {
    return res.status(405).json({ success: false, err: "Method Not Allowed" });
  }

  // 確認傳入的 signId 參數有效
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
    // 獲取 MySQL 連接
    const connection = await mysqlConnectionPool.getConnection();

    // 查詢單一生理資料
    interface VitalSign {
      signId: number;
      [key: string]: string | number | null; // Adjust fields based on your database schema
    }

    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM vitalsigns WHERE signId = ?`,
      [parsedSignId]
    );

    const vitalSign = rows as unknown as VitalSign[];

    if (!vitalSign || vitalSign.length === 0) {
      return res.status(404).json({ success: false, err: "未找到生理資料" });
    }

    // 返回找到的生理資料
    return res
      .status(200)
      .json({ success: true, vitalSign: (vitalSign as any)[0] });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "未知錯誤";
    return res
      .status(500)
      .json({ success: false, err: `內部錯誤: ${errorMessage}` });
  }
};
