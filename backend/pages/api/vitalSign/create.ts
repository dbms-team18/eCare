import mysqlConnectionPool from "../../../src/lib/mysql";
import { NextApiRequest, NextApiResponse } from "next";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import axios from "axios";

const createVitalSign = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, err: "Method Not Allowed" });
  }

  const {
    userId,
    patientId,
    vitalTypeId,
    bloodSugar,
    systolic,
    diastolic,
    heartRate,
    bloodO2,
    weight,
    create_date,
    time,
    comment,
  } = req.body;

  // 檢查必要欄位
  if (!userId || !patientId || !vitalTypeId || !create_date || !time) {
    return res.status(400).json({ success: false, err: "缺少必要欄位" });
  }

  // 根據 typeId 決定要儲存的生理資料
  let value: number | null = null;
  switch (Number(vitalTypeId)) {
    case 1: // bloodSugar
      if (bloodSugar !== undefined) {
        value = Number(bloodSugar);
      }
      break;
    case 2: // systolic
      if (systolic !== undefined) {
        value = Number(systolic);
      }
      break;
    case 3: // diastolic
      if (diastolic !== undefined) {
        value = Number(diastolic);
      }
      break;
    case 4: // heartRate
      if (heartRate !== undefined) {
        value = Number(heartRate);
      }
      break;
    case 5: // bloodO2
      if (bloodO2 !== undefined) {
        value = Number(bloodO2);
      }
      break;
    case 6: // weight
      if (weight !== undefined) {
        value = Number(weight);
      }
      break;
    default:
      return res
        .status(400)
        .json({ success: false, err: "無效的 vitalTypeId" });
  }

  if (value === null) {
    return res.status(400).json({ success: false, err: "缺少測量值" });
  }

  // 使用 MySQL 插入資料
  const connection = await mysqlConnectionPool.getConnection();
  try {
    // 先獲取該 vitalTypeId 的上下限值
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

    // 插入生理資料
    const [result] = await connection.execute<ResultSetHeader>(
      `
      INSERT INTO vitalsigns (userId, patientId, vitalTypeId, value, recordDateTime, comment, alertTrigger)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        patientId,
        vitalTypeId,
        value,
        `${create_date} ${time}`, // 合併日期和時間
        comment || null, // 備註，如果沒有就傳 null
        alertTrigger ? 1 : 0, // 根據檢查結果設置警報觸發
      ]
    );

    const signId = result.insertId;

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

    // 回傳成功訊息
    return res.status(200).json({
      success: true,
      message: "生理資料創建成功",
      signId,
      alertTrigger,
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

export default createVitalSign;
