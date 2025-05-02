import { NextApiRequest, NextApiResponse } from 'next';
import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Define Patient interface that extends RowDataPacket
interface Patient extends RowDataPacket {
  id: number;
  userId: number;
  name: string;
  age: number;
  gender: string;
  addr: string;
  emerName: string;
  emerPhone: string;
  info: string;
  lastUpd: string;
  lastUpdId: number;
}

export const updatePatient = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, err: 'Method Not Allowed' });
  }
  
  const {
    patientId,
    userId,
    name,
    age,
    gender,
    addr,
    emerName,
    emerPhone,
    info
  } = req.body;
  
  // 檢查必要欄位 - 只檢查 patientId 和 userId
  if (!patientId || !userId) {
    return res.status(400).json({ success: false, err: '缺少必要欄位' });
  }
  
  let connection;
  
  try {
    // Create a connection
    connection = await mysql.createConnection(dbConfig);
    
    // Begin transaction
    await connection.beginTransaction();
    
    // 先取得目前病患資料
    const [patients] = await connection.execute<Patient[]>(
      'SELECT * FROM patient WHERE id = ?',
      [patientId]
    );
    
    // Check if patient exists
    if (!patients || patients.length === 0) {
      return res.status(404).json({ success: false, err: '病患資料未找到' });
    }
    
    // Get the current patient data
    const currentPatient = patients[0];
    
    // 設定更新時間
    const currentDate = new Date().toISOString();
    
    // 更新病患資料，若沒有提供則使用原有的值
    const [result] = await connection.execute<ResultSetHeader>(
      `UPDATE patient 
       SET 
        userId = ?,
        name = ?,
        age = ?,
        gender = ?,
        addr = ?,
        emerName = ?,
        emerPhone = ?,
        info = ?,
        lastUpd = ?,
        lastUpdId = ?
       WHERE id = ?`,
      [
        userId,
        name || currentPatient.name,
        age ? parseInt(age) : currentPatient.age,
        gender || currentPatient.gender,
        addr || currentPatient.addr,
        emerName || currentPatient.emerName,
        emerPhone || currentPatient.emerPhone,
        info !== undefined ? info : currentPatient.info,
        currentDate,
        userId,
        patientId
      ]
    );
    
    // Check if the update affected any rows
    const affectedRows = result.affectedRows;
    
    if (affectedRows === 0) {
      await connection.rollback();
      return res.status(500).json({ 
        success: false, 
        err: '更新失敗'
      });
    }
    
    // Get the updated patient data
    const [updatedPatients] = await connection.execute<Patient[]>(
      'SELECT * FROM patient WHERE id = ?',
      [patientId]
    );
    
    if (!updatedPatients || updatedPatients.length === 0) {
      await connection.rollback();
      return res.status(500).json({ 
        success: false, 
        err: '無法取得更新後的病患資料'
      });
    }
    
    const updatedPatient = updatedPatients[0];
    
    // Commit the transaction
    await connection.commit();
    
    return res.status(200).json({
      success: true,
      data: updatedPatient,
    });
  } catch (err: unknown) {
    // Rollback transaction in case of error
    if (connection) {
      await connection.rollback();
    }
    
    console.error('Update patient error:', err);
    return res.status(500).json({
        success: false,
        err: `內部錯誤: ${err instanceof Error ? err.message : String(err)}`,
    });
  } finally {
    // Close the connection
    if (connection) {
      await connection.end();
    }
  }
};