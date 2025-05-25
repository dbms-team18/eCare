import mysqlConnectionPool from "../../../src/lib/mysql";
import { NextApiRequest, NextApiResponse } from "next";
import { RowDataPacket } from "mysql2";

const getAllVitalSigns = async (req: NextApiRequest, res: NextApiResponse) => {
    // 跨域設定
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(200).end();
    }
    if (req.method !== "GET") {
    return res.status(405).json({ success: false, err: "Method Not Allowed" });
  }

  interface VitalSignRow extends RowDataPacket {
  signId: number;
  vitalTypeId: number;
  value: string;
  recordDateTime: Date;
  comment: string;
  status:number;
}

  const userId = parseInt(req.query.userId as string, 10);
  const patientId = req.query.patientId;

  if (isNaN(userId)) {
    return res
      .status(400)
      .json({ success: false, err: "userId 必須是有效的數字" });
  }

  if (!patientId) {
    return res
      .status(400)
      .json({ success: false, err: "缺少 patientId 參數" });
  }

  const connection = await mysqlConnectionPool.getConnection();
  try {
    const [topVitalSigns] = await connection.execute<VitalSignRow[]>(
      `WITH TOP_VITAL_SIGNS AS (
         SELECT vitalTypeId, MAX(recordDateTime) AS maxTime
         FROM vitalsigns
         WHERE userId = ? AND patientId = ?
         GROUP BY vitalTypeId
       )
       SELECT v.signId, v.vitalTypeId, v.value, v.recordDateTime, v.comment, v.status
       FROM vitalsigns v
       JOIN TOP_VITAL_SIGNS t
       ON v.vitalTypeId = t.vitalTypeId AND v.recordDateTime = t.maxTime
       WHERE v.userId = ? AND v.patientId = ?;`,
      [userId, patientId, userId, patientId] // 外層 WHERE 要補上 userId / patientId 限制
    );

    if (topVitalSigns.length === 0) {
      return res.status(200).json({
        success: true,
        message: "尚未有生理資料紀錄",
        data: [],
  });
}


    return res.status(200).json({
    success: true,
    data: topVitalSigns as VitalSignRow[],
});

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "未知錯誤";
    return res
      .status(500)
      .json({ success: false, err: `內部錯誤: ${errorMessage}` });
  } finally {
    connection.release();
  }
};

export default getAllVitalSigns;
