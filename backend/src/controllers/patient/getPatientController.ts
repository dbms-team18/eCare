import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export const getPatient = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
  
  const { patientId } = req.query;
  
  // 檢查是否傳入 patientId
  if (!patientId) {
    return res.status(400).json({ success: false, message: '缺少 patientId 參數' });
  }
  
  let connection;
  
  try {
    // Create a connection
    connection = await mysql.createConnection(dbConfig);
    
    // Query for patient by ID
    const [patients] = await connection.execute(
      `SELECT 
        id,
        name,
        age,
        gender,
        addr,
        id_number,
        nhCardNum,
        emerName,
        emerPhone,
        info,
        isArchived,
        lastUpd,
        lastUpdId,
        userId
      FROM patient 
      WHERE id = ?`,
      [Number(patientId)]
    );
    
    // Convert result to array and check if patient exists
    const patientsArray = patients as unknown[];
    
    if (!patientsArray || patientsArray.length === 0) {
      return res.status(404).json({ success: false, message: '病患資料未找到' });
    }
    
    const patient = patientsArray[0];
    
    // 直接回傳查詢結果，保持與 getAllPatients 的一致性
    return res.status(200).json({
      success: true,
      message: '取得病患資料成功',
      data: patient
    });
    
  } catch (err: unknown) {
    console.error('Get patient error:', err);
    return res.status(500).json({ 
      success: false, 
      message: `內部錯誤: ${err as Error}` 
    });
  } finally {
    // Close the connection
    if (connection) {
      await connection.end();
    }
  }
};