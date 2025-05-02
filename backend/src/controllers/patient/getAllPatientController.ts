import { NextApiRequest, NextApiResponse } from 'next';
// Use the standard import for MySQL2
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export const getAllPatients = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, err: 'Method Not Allowed' });
  }

  const { userId } = req.query;
  
  // 檢查是否傳入 userId
  if (!userId) {
    return res.status(400).json({ success: false, err: '缺少 userId 參數' });
  }

  let connection;

  try {
    // Create a connection
    connection = await mysql.createConnection(dbConfig);
    
    // Query for patients managed by this userId
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
        lastUpd 
      FROM patient 
      WHERE userId = ? 
      ORDER BY name ASC`,
      [Number(userId)]
    );

    // 如果沒有找到病患資料
    if (!Array.isArray(patients) || patients.length === 0) {
      return res.status(404).json({ success: false, message: '沒有找到病患資料' });
    }

    return res.status(200).json({
      success: true,
      data: patients
    });
  } catch (err: unknown) {
    console.error('Get all patients error:', err);
    return res.status(404).json({ 
      success: false, 
      message: '病患資料未找到' 
    });
  } finally {
    // Close the connection
    if (connection) {
      await connection.end();
    }
  }
};