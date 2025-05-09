import type { NextApiRequest, NextApiResponse } from 'next'

// DB 相關
import mysqlConnectionPool from "../../../src/lib/mysql"


// interface AlertRow extends RowDataPacket{
//     alertId:number;
//     patientId: number;
//     signId: number;
//     alertType:string;
//     alertMessage: string;
//     alertTime: string;
//     alertTrigger:boolean;
//   }


  export const readAlert = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') return res.status(405).end();
    
    // req 要傳入的參數  
    const { userID, signID } = req.body;

    try {
      const connection = await mysqlConnectionPool.getConnection();
      try {
        // 撈出所有未讀的 alert 
        await connection.execute(
            `UPDATE alert SET alertTrigger = 0 WHERE signId = ? AND userId = ? `,
            [signID, userID]
          );
    
          return res.status(200).json({
            success: true,
            message: "已讀 alert",
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
