import mysqlConnectionPool from "../../../src/lib/mysql";
import { NextApiRequest, NextApiResponse } from "next";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import axios from "axios";

export const updateVitalSign = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }
  if (req.method !== "POST") {
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

  const connection = await mysqlConnectionPool.getConnection();
  try {
    // 獲取該 vitalTypeId 的上下限值
    const [vitalTypes] = await connection.execute<RowDataPacket[]>(
      `SELECT * FROM vitaltype WHERE vitalTypeId = ?`,
      [vitalTypeId]
    );

    if (vitalTypes.length === 0) {
      return res
        .status(404)
        .json({ success: false, err: "找不到對應的生理指標類型" });
    }

    const vitalType = vitalTypes[0];
    const { upperBound, lowerBound } = vitalType;

    // 檢查是否超過上限或低於下限
    let alertTrigger = false;

    if (value > upperBound || value < lowerBound) {
      alertTrigger = true;
    }

    // 更新生理資料
    const [result]: [ResultSetHeader, RowDataPacket[]] =
      await connection.execute(
        `
      UPDATE vitalsigns 
      SET 
        userId = ?, 
        patientId = ?, 
        vitalTypeId = ?, 
        value = ?, 
        recordDateTime = ?, 
        comment = ?, 
        alertTrigger = ?
      WHERE signId = ?`,
        [
          userId,
          patientId,
          vitalTypeId,
          value,
          recordDateTime,
          comment,
          alertTrigger ? 1 : 0, // 根據檢查結果設置警報觸發
          signId,
        ]
      );

    // 如果沒有更新的行，返回 404
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, err: "未找到對應的資料" });
    }

    // 如果需要觸發警報，呼叫 alert/create API
    if (alertTrigger) {
      try {
        // 呼叫 alert/create API
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/alert/create`,
          {
            userId,
            patientId,
            vitalSignId: signId,
            vitalTypeId,
          }
        );
      } catch {
        // 即使警報創建失敗，我們仍然繼續執行
        console.error("警報創建失敗");
      }
    }

    return res.status(200).json({
      success: true,
      message: "生理資料更新成功",
      signId: signId,
      alertTrigger,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "未知錯誤";
    return res.status(500).json({
      success: false,
      err: `內部錯誤: ${errorMessage}`,
    });
  } finally {
    // 釋放連接回連接池
    connection.release();
  }
};

export default updateVitalSign;
