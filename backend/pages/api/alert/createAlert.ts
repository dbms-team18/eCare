import type { NextApiRequest, NextApiResponse } from 'next'

// DB 相關
import type { ResultSetHeader } from 'mysql2';
import { RowDataPacket } from 'mysql2';
import mysqlConnectionPool from "../../../src/lib/mysql"




interface VitalRow extends RowDataPacket{
    patientId: string;
    userId: number;
    signId:number;
    vitalTypeId: string;
    typeName:string;
    value: number;
    recordDateTime: string;
    alertTrigger:boolean;
  }

  export const createAlert = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') return res.status(405).end();
  
    const { userId, patientId, vitalTypeId } = req.body;
  
    if (!userId || !patientId || !vitalTypeId) {
      return res.status(400).json({ message: '缺少必要欄位 userId、patientId 或 vitalTypeId' });
    }
  
    try {
      const connection = await mysqlConnectionPool.getConnection();
      try {
        const [vitalRows] = await connection.execute<VitalRow[]>(
          `SELECT signId, userId, patientId, vitalsigns.vitalTypeId, typeName, value, recordDateTime, alertTrigger
           FROM vitalsigns 
           LEFT JOIN vitaltype ON vitalsigns.vitalTypeId = vitaltype.vitalTypeId 
           WHERE alertTrigger = 1 AND userId = ? AND patientId = ? AND vitalsigns.vitalTypeId = ?`,
          [userId, patientId, vitalTypeId]
        );
  
        if (vitalRows.length === 0) {
          return res.status(404).json({ message: '查無符合條件的生命徵象資料' });
        }
  
        const insertedAlerts = [];
  
        for (const vital of vitalRows) {
          const [result] = await connection.execute<ResultSetHeader>(
            `INSERT INTO alert (patientId, userId, signId, alertType, alertMessage, alertTime, alertTrigger)
             VALUES (?, ?, ?, ?, ?, NOW(), 1)`,
            [
              vital.patientId,
              userId,
              // signId 是指對應的 sign row 不要再改了！！！
              vital.signId,
              vital.typeName,
              `${vital.typeName} need to be noticed`
            ]
          );
  
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
      const stack = err instanceof Error ? err.stack : null;
      return res.status(500).json({ message: `內部錯誤: ${message}`, stack });
    }
  };
  

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') return createAlert(req, res)
  return res.status(405).end()
}
