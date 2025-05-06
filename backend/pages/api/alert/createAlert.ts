import type { NextApiRequest, NextApiResponse } from 'next'

// DB 相關
import type { ResultSetHeader } from 'mysql2';
import { RowDataPacket } from 'mysql2';
import mysqlConnectionPool from "../../../src/lib/mysql"




interface VitalRow extends RowDataPacket{
    signId:number;
    userId: number;
    patientId: string;
    vitalTypeId: string;
    typeName:string;
    value: number;
    recordDateTime: string;
    alertTrigger:boolean;
  }


  export const createAlert = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') return res.status(405).end();
    
    try {
      const connection = await mysqlConnectionPool.getConnection();
      try {
        // 撈出所有觸發 alert 的 vital sign
        const [vitalRows] = await connection.execute<VitalRow[]>(
          `SELECT signId, userId, patientId, vitalsigns.vitalTypeID, typeName, value, recordDateTime, alertTrigger
           FROM vitalsigns 
           LEFT JOIN vitaltype ON vitalsigns.vitalTypeID = vitaltype.vitalTypeID 
           WHERE alertTrigger = 1`
        );
  
        const insertedAlerts = [];
  
        for (let i = 0; i < vitalRows.length; i++) {
            const vital = vitalRows[i];

             // 插入 alert
            const [result] = await connection.execute<ResultSetHeader>(
              `INSERT INTO alert (patientId, signId, alertType, alertMessage, alertTime, alertTrigger)
               VALUES (?, ?, ?, ?, NOW(), 1)`,
              [
                vital.patientId,
                vital.signId,
                vital.typeName,
                `${vital.typeName} need to be noticed`
              ]
            );
          
            // 更新 alertTrigger = 0，避免重複建立 alert
            await connection.execute(
              `UPDATE vitalsigns SET alertTrigger = 0 WHERE signId = ?`,
              [vital.signId]
            );
          
            insertedAlerts.push({
              alertId: result.insertId,
              patientId: vital.patientId,
              alertType: vital.typeName,
              message: `Alert ${result.insertId} inserted successfully!`,
              date: new Date().toISOString()
            });
          }
          
  
        return res.status(200).json({ alerts: insertedAlerts });
      } finally {
        connection.release();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '未知錯誤';
      return res.status(500).json({ message: `內部錯誤: ${message}` });
    }
  };
  


export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') return createAlert(req, res)
  return res.status(405).end()
}
