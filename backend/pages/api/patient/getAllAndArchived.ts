
import type { NextApiRequest, NextApiResponse } from 'next';
import { RowDataPacket } from 'mysql2';
import mysqlConnectionPool from '../../../src/lib/mysql';
import { parse } from 'cookie';

interface PatientRow extends RowDataPacket {
  patientId: number;
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

// Helper function to get all patients
async function getAllAndArchived(userId: number): Promise<PatientRow[]> {
  const connection = await mysqlConnectionPool.getConnection();
  
  try {
    // 查詢病患資料
    const [patients] = await connection.execute<PatientRow[]>(
      'SELECT * FROM patient WHERE userId = ? OR familyId = ? ORDER BY lastUpd DESC',
      [userId, userId]
    );
    
    return patients;
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

// 從 cookie 取得 uid
const cookieHeader = req.headers.cookie;
const cookies = cookieHeader ? parse(cookieHeader) : {};
const uid = cookies.uid;

if (!uid) {
  return res.status(401).json({ success: false, message: '未登入或缺少 uid cookie' });
}
  const { userId } = req.query;
  
  // Use userId from query or uid from cookie
  const targetUserId = userId ? Number(userId) : Number(uid);
  
  if (!targetUserId) {
    return res.status(400).json({ success: false, message: '缺少 userId 參數' });
  }

  try {
    const patients = await getAllAndArchived(targetUserId);

    // 修改：即使沒有病患資料也返回200狀態碼和空陣列
    console.log(
      `查詢到 ${patients.length} 筆病患資料，用戶ID: ${targetUserId}`
    );

    // 回傳查詢結果
    return res.status(200).json({
      success: true,
      data: patients
    });

  } catch (err: unknown) {
    console.error('Get all patients error:', err);
    return res.status(500).json({ 
      success: false, 
      message: err instanceof Error ? err.message : String(err)
    });
  }
}