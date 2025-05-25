import type { NextApiRequest, NextApiResponse } from 'next';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import mysqlConnectionPool from '../../../src/lib/mysql';

export const bindPatient = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
    // Get request body
    const {
      idNum,
      userId,} = req.body;
    

    // 檢查必要欄位 patientId 和 userId 
    if (!idNum || !userId) {
      return res.status(400).json({ success: false, message: '缺少必要欄位' });
    }

    // 連線 DB
    const connection = await mysqlConnectionPool.getConnection();
    
    try {
      // 修改 familyId 欄位
      const [result] = await connection.execute<ResultSetHeader>(
        'UPDATE patient SET familyId = ? WHERE idNum = ?',
        [userId, idNum]
      );
      
      // Check if update was successful
      if (result.affectedRows === 0) {
        return res.status(500).json({ success: false, message: '更新失敗' });
      }
      
          
      return res.status(200).json({
        success: true,
        message: '病患綁定成功',
        affectedRows: result.affectedRows,
      });
    } catch (err: any) {
        console.error('Update patient error:', err);
        return res.status(500).json({
            success: false,
            message: `內部錯誤: ${err.message}`
    });
  } finally {
    connection.release();
    }

};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 跨域設定
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method === 'POST') {
    return bindPatient(req, res);
  }
  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}