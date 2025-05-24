import { NextApiRequest, NextApiResponse } from 'next';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import mysqlConnectionPool from '../../../src/lib/mysql';
import { parse } from 'cookie';

// Type for the patient data
interface PatientRow extends RowDataPacket {
  id: number;
  name: string;
  age: number;
  gender: string;
  addr: string;
  idNum: string;
  nhCardNum: string;
  emerName: string;
  emerPhone: string;
  info: string;
  isArchived: boolean;
  lastUpd: string;
  lastUpdId: number;
  userId: number;
}

//manage patient status(achieve/delete)
async function managePatientStatus(patientId: number, userId: number, isArchived: boolean): Promise<PatientRow | null> {
  const connection = await mysqlConnectionPool.getConnection();
  
  try {
    if (isArchived) {
      // Archive the patient
      const [result] = await connection.execute<ResultSetHeader>(
        `UPDATE patient SET 
          isArchived = ?, 
          lastUpd = NOW(), 
          lastUpdId = ? 
          WHERE patientId = ? AND userId = ?`,
        [true, userId, patientId, userId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('病歷不存在');
      }
      
      // Get the updated patient data
      const [patients] = await connection.execute<PatientRow[]>(
        'SELECT * FROM patient WHERE patientId = ? AND userId = ?',
        [patientId, userId]
      );
      
      return patients.length > 0 ? patients[0] : null;
    } else {
      // Delete the patient completely
      const [result] = await connection.execute<ResultSetHeader>(
        'DELETE FROM patient WHERE patientId = ? AND userId = ?',
        [patientId, userId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('病歷不存在');
      }
      
      return null; // Patient deleted
    }
  } finally {
    connection.release();
  }
}

// Main API handler 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 跨域設定
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // 從 cookie 取得 uid
  const cookieHeader = req.headers.cookie;
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const uid = cookies.uid;

  if (!uid) {
    return res.status(401).json({ success: false, message: '未登入或缺少 uid cookie' });
  }

  try {
    // Get request body
    const { 
      patientId,
      userId, 
      isArchived 
    } = req.body;
    
    // Use userId from body or uid from cookie
    const targetUserId = userId ? Number(userId) : Number(uid);
    
    // 檢查必要欄位
    if (!patientId || !targetUserId || isArchived === undefined) {
      return res.status(400).json({ success: false, message: '缺少必要欄位' });
    }
    
    const result = await managePatientStatus(Number(patientId), targetUserId, Boolean(isArchived));
    
    if (isArchived) {
      return res.status(200).json({ 
        success: true, 
        message: '病歷已封存', 
        data: result 
      });
    } else {
      return res.status(200).json({
        success: true,
        message: '病歷已刪除',
        data: null
      });
    }

  } catch (error) {
    console.error('Manage patient status error:', error);
    
    if (error instanceof Error && error.message === '病歷不存在') {
      return res.status(404).json({ success: false, message: error.message });
    }
    
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : '內部錯誤',
      data: null
    });
  }
}
