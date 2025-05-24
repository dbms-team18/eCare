import type { NextApiRequest, NextApiResponse } from 'next';
import { RowDataPacket } from 'mysql2';
import mysqlConnectionPool from '../../../src/lib/mysql';
import { parse } from 'cookie';

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

// Helper function to get patient data
async function getPatientData(patientId: number, userId: number): Promise<PatientRow | null> {
  const connection = await mysqlConnectionPool.getConnection();
  
  try {
    // 查詢病患資料
    const [patients] = await connection.execute<PatientRow[]>(
      `SELECT * FROM patient 
       WHERE patientId = ? AND userId = ?`,
      [patientId, userId]
    );
    
    return patients.length > 0 ? patients[0] : null;
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

  const { patientId, userId } = req.query;
  
  // Use userId from query or uid from cookie
  const targetUserId = userId ? Number(userId) : Number(uid);
  
  // 檢查是否傳入必要參數
  if (!patientId || !targetUserId) {
    return res.status(400).json({ success: false, message: '缺少必要參數' });
  }

  try {
    const patient = await getPatientData(Number(patientId), targetUserId);
    
    // Check if patient exists
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: '病患資料未找到' 
      });
    }
    
    // Map database fields to response object
    const patientData = { 
      id: patient.id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      addr: patient.addr,
      idNum: patient.idNum, 
      nhCardNum: patient.nhCardNum, 
      emerName: patient.emerName, 
      emerPhone: patient.emerPhone, 
      info: patient.info,
      isArchived: patient.isArchived,
      lastUpd: patient.lastUpd
    };
    
    // 若成功 回傳以上病患資料
    return res.status(200).json({
      success: true,
      data: patientData
    });

  } catch (err: unknown) {
    console.error('Get patient data error:', err);
    return res.status(500).json({ 
      success: false, 
      message: err instanceof Error ? err.message : String(err)
    });
  }
}