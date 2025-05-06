import type { NextApiRequest, NextApiResponse } from 'next'

// DB 相關
import { RowDataPacket } from 'mysql2';
import mysqlConnectionPool from "../../../src/lib/mysql"


interface AlertRow extends RowDataPacket{
    alertId:number;
    patientId: number;
    signId: number;
    alertType:string;
    alertMessage: string;
    alertTime: string;
    alertTrigger:boolean;
  }


  export const getUnread = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') return res.status(405).end();
    
    try {
      const connection = await mysqlConnectionPool.getConnection();
      try {
        // 撈出所有未讀的 alert 
        const [alertRows] = await connection.execute<AlertRow[]>(
          `SELECT * FROM alert WHERE alertTrigger = 1`
        );
        const allAlertData = alertRows.map((alert) => ({
            alertID: alert.alertId,
            alertTrigged: alert.alertTrigger, // 注意拼字
            patientId: alert.patientId,
            alertInfo: alert.alertMessage,
            timestamp: alert.alertTime
          }));
    
          return res.status(200).json({
            success: true,
            message: "成功取得未讀警報",
            err: null,
            allAlertData
          });
        
        }finally {
            connection.release();
          }
      }catch (err: unknown) {
        const message = err instanceof Error ? err.message : '未知錯誤';
        return res.status(500).json({ message: `內部錯誤: ${message}` });
      }
  }


export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') return getUnread(req, res)
  return res.status(405).end()
}
