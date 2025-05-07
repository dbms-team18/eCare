import mysqlConnectionPool from "../../../src/lib/mysql";
import { NextApiRequest, NextApiResponse } from "next";
import { RowDataPacket } from "mysql2";

const getAllVitalSigns = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, err: "Method Not Allowed" });
  }

  const userId = parseInt(req.query.userId as string, 10); // 確保 userId 是數字型態

  if (isNaN(userId)) {
    return res
      .status(400)
      .json({ success: false, err: "userId 必須是有效的數字" });
  }
  const connection = await mysqlConnectionPool.getConnection();
  try {
    // 查詢該用戶管理的所有生理資料，並按照 recordDateTime 降序排序 (最新的在前面)
    const [vitalSigns] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM vitalsigns WHERE userId = ? ORDER BY recordDateTime DESC`,
      [userId]
    );

    // 如果沒有找到任何資料，返回 404 錯誤
    if (Array.isArray(vitalSigns) && vitalSigns.length === 0) {
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
  } finally {
    // 釋放連接回連接池
    connection.release();
  }
};

export default getAllVitalSigns;
