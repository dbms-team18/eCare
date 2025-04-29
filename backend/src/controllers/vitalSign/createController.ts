import mysqlConnectionPool from "../../lib/mysql";
import { NextApiRequest, NextApiResponse } from "next";
import { ResultSetHeader } from "mysql2";

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

  // 根據 typeId 決定要儲存的生理資料
  let value: number | null = null;
  switch (typeId) {
    case 1: // bloodSugar
      if (bloodSugar !== undefined) {
        value = bloodSugar;
      }
      break;
    case 2: // systolic
      if (systolic !== undefined) {
        value = systolic;
      }
      break;
    case 3: // diastolic
      if (diastolic !== undefined) {
        value = diastolic;
      }
      break;
    case 4: // bloodO2
      if (bloodO2 !== undefined) {
        value = bloodO2;
      }
      break;
    case 5: // heartRate
      if (heartRate !== undefined) {
        value = heartRate;
      }
      break;
    default:
      return res.status(400).json({ success: false, err: "無效的 typeId" });
  }

  if (value === null) {
    return res.status(400).json({ success: false, err: "缺少測量值" });
  }

  // 使用 MySQL 插入資料
  const connection = await mysqlConnectionPool.getConnection();
  try {
    // 插入生理資料
    const [result] = await connection.execute<ResultSetHeader>(
      `
      INSERT INTO vitalsigns (userId, patientId, vitalTypeId, value, recordDateTime, comment, alertTrigged)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        patientId,
        typeId,
        value,
        create_date, // 傳入的測量時間
        comment || null, // 備註，如果沒有就傳 null
        0, // 預設不觸發警報
      ]
    );

    // 回傳成功訊息
    return res.status(200).json({
      success: true,
      message: "生理資料創建成功",
      signId: result.insertId,
      alertTriggered: false,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "未知的錯誤";
    return res.status(500).json({
      success: false,
      err: `內部錯誤: ${errorMessage}`,
    });
  } finally {
    connection.release();
  }
};
