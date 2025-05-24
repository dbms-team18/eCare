//final
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
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    //跨域設定
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
  
    //從 cookie 取 uid
    const cookieHeader = req.headers.cookie;
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const uid = cookies.uid;
  
    if (!uid) {
      return res.status(401).json({ success: false, message: '未登入或缺少 uid cookie' });
    }
  
    const { userId, patientId } = req.query;
    
    //檢查patientId是否傳入 
    if (!patientId) {
      return res.status(400).json({ success: false, message: '缺少 patientId 參數' });
    }

//export const getPatient = async (req: NextApiRequest, res: NextApiResponse) => {
//  if (req.method !== 'GET') {
//    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
//  }

  //const { userId, patientId } = req.query;
  
   //檢查patientId是否傳入 
  if (!patientId) {
    return res.status(400).json({ success: false, message: '缺少 patientId 參數' });
  }

  try {
    const connection = await mysqlConnectionPool.getConnection();
    
    try {
      // 查詢病患資料
      const [patients] = await connection.execute<PatientRow[]>(
        `SELECT 
          userId, 
          name, 
          age, 
          gender, 
          addr, 
          idNum, 
          nhCardNum, 
          emerName, 
          emerPhone, 
          info, 
          isArchived, 
          lastUpd, 
          lastUpdId, 
          userId 
        FROM patient 
        WHERE patientId = ? AND userId = ?`,
        [Number(patientId), Number(userId)]
      );
      
      // Check if patient exists
      if (!patients || patients.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: '無權限或病患資料不存在' 
        });
      }
      
      const patient = patients[0];
      
      // 直接回傳查詢結果，保持與 getAllPatients 一致
      return res.status(200).json({
        success: true,
        message: '取得病患資料成功',
        data: patient
      });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Get patient error:', err);
    const errorMessage = err instanceof Error ? err.message : '未知錯誤';
    return res.status(500).json({ 
      success: false, 
      message: `內部錯誤: ${errorMessage}` 
    });
  }
};

//export default function handler(req: NextApiRequest, res: NextApiResponse) {
//  if (req.method === 'GET') {
//    return getPatient(req, res);
//  }
//  return res.status(405).json({ success: false, message: 'Method Not Allowed' });

