import type { NextApiRequest, NextApiResponse } from "next";

// DB 相關
import { RowDataPacket } from "mysql2";
import mysqlConnectionPool from "../../../src/lib/mysql";
import { parse } from "cookie";

interface AlertRow extends RowDataPacket {
  alertId: number;
  userId: number;
  patientId: number;
  signId: number;
  alertType: string;
  alertMessage: string;
  alertTime: string;
  alertTrigger: boolean;
}

export const getUnread = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") return res.status(405).end();

  // userID 從 cookie 抓
  // const cookies = parse(req.headers.cookie || "");
  // const userID = cookies.uid;
  // if (!userID) {
  //   return res.status(401).json({ success: false, message: '未登入' });
  // }

  //  定義 request 要輸入的參數
  const { patientID } = req.body;
  try {
    const connection = await mysqlConnectionPool.getConnection();
    try {
      // 撈出所有未讀的 alert
      const [alertRows] = await connection.execute<AlertRow[]>(
        `SELECT * FROM alert WHERE alertTrigger = 1 AND patientId = ? `,
        [patientID]
      );
      // 用來裝撈出的資料
      const allAlertData = alertRows.map((alert) => ({
        alertId: alert.alertId,
        userId: alert.userId,
        patientId: alert.patientId,
        signId: alert.signId,
        alertType: alert.alertType,
        alertMessage: alert.alertMessage,
        alertTime: alert.alertTime,
        alertTrigger: alert.alertTrigger, // 注意拼字
      }));
      if (allAlertData.length > 0) {
        return res.status(200).json({
          success: true,
          message: "成功取得未讀警報",
          err: null,
          allAlertData,
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "無未讀警報",
          err: null,
          allAlertData: [],
        });
      }
    } finally {
      connection.release();
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "未知錯誤";
    return res.status(500).json({ message: `內部錯誤: ${message}` });
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 跨域設定
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }
  if (req.method === "POST") return getUnread(req, res);
  return res.status(405).end();
}
