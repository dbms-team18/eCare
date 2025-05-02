import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export const readPatient = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, err: 'Method Not Allowed' });
  }
  
  const { userId, patientId } = req.query;
  
  // 檢查是否傳入 userId 和 patientId
  if (!userId || !patientId) {
    return res.status(400).json({ success: false, err: '缺少 userId 或 patientId 參數' });
  }
  
  let connection;
  
  try {
    // Create a connection
    connection = await mysql.createConnection(dbConfig);
    
    // Query for patient by ID and userId
    const [patients] = await connection.execute<mysql.RowDataPacket[]>(
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
        lastUpd
        FROM patient 
        WHERE id = ? AND userId = ?`,
      [Number(patientId), Number(userId)]
    );
    
   // Check if patient exists
   if (!patients || (patients as mysql.RowDataPacket[]).length === 0) {
    return res.status(404).json({ success: false, err: '病患資料未找到' });
  }
  
  const patient = patients[0];
    
    // 回傳病患資料
    const patientInfo = {
      patientId: patient.id, //patient unkown????????
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      addr: patient.addr,
      idNum: patient.id_number,
      nhCardNum: patient.nhCardNum,
      emerName: patient.emerName,
      emerPhone: patient.emerPhone,
      info: patient.info,
      isArchived: patient.isArchived,
      lastUpd: patient.lastUpd,
    };
    
    return res.status(200).json({ success: true, patientData: patientInfo });
    
  } catch (err: unknown) {
    console.error('Read patient error:', err);
    return res.status(500).json({ success: false, err: `內部錯誤: ${err as Error}` });
  } finally {
    // Close the connection
    if (connection) {
      await connection.end();
    }
  }
};
