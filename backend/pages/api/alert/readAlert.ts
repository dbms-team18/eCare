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


  export const readAlert = async (req: NextApiRequest, res: NextApiResponse) => {
    const { alertId } = req.body;
    if (req.method !== 'POST') return res.status(405).end();
    
    try {
      const connection = await mysqlConnectionPool.getConnection();
      try {
        // 撈出所有未讀的 alert 
        await connection.execute(
            `UPDATE alert SET alertTrigger = 0 WHERE alertId = ?`,
            [alertId]
          );
    
          return res.status(200).json({
            success: true,
            message: "已讀"+alertId+"號 alert",
            err: null,
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
  if (req.method === 'POST') return readAlert(req, res)
  return res.status(405).end()
}
