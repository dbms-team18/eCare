import type { NextApiRequest, NextApiResponse } from 'next'

// DB 相關
import mysqlConnectionPool from "../../../src/lib/mysql"


// interface AlertRow extends RowDataPacket{
    // alertId:number;
    // userId: number;
    // patientId: number;
    // signId: number;
    // alertType:string;
    // alertMessage: string;
    // alertTime: string;
    // alertTrigger:boolean;
//   }


  export const readAlert = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') return res.status(405).end();
    
    // req 要傳入的參數  
    const { userID, alertID } = req.body;
    if (!userID || !alertID) {
      return res.status(400).json({
        success: false,
        message: `缺少必要參數 userID 或 alertID（userID = ${userID}, alertID = ${alertID}）`,
      });
}


    try {
      const connection = await mysqlConnectionPool.getConnection();
      try {
        // 更新已讀的 alert 
        await connection.execute(
            `UPDATE alert SET alertTrigger = 0 WHERE alertId = ? AND userId = ? `,
            [alertID, userID]
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
  // 跨域設定
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  
  if (req.method === 'POST') return readAlert(req, res)
  return res.status(405).end()
}
