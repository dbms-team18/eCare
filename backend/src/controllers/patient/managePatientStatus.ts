import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export const managePatientStatus = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, err: 'Method Not Allowed' });
  }
  
  const { patientId, userId, isArchived } = req.body;
  
  // 檢查必要欄位
  if (!patientId || !userId || isArchived === undefined) {
    return res.status(400).json({ success: false, err: '缺少必要欄位' });
  }
  
  let connection;
  
  try {
    // Create a connection
    connection = await mysql.createConnection(dbConfig);
    
    // Begin transaction
    await connection.beginTransaction();
    
    // 當 isArchived = true，標記資料為「封存」
    if (isArchived) {
      const currentDate = new Date().toISOString();
      
      const [result] = await connection.execute(
        `UPDATE patient 
         SET isArchived = true, 
             lastUpd = ?, 
             lastUpdId = ? 
         WHERE id = ?`,
        [currentDate, userId, patientId]
      );
      
      // Check if the update affected any rows
      const affectedRows = (result as mysql.ResultSetHeader).affectedRows;
      
      if (affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ 
          success: false, 
          err: '找不到指定病歷',
          data: null
        });
      }
      
      // Get the updated patient data
      const [patients] = await connection.execute(
        `SELECT * FROM patient WHERE id = ?`,
        [patientId]
      );
      
      const patientsArray = patients as unknown[];
      const updatedPatient = patientsArray[0];
      
      await connection.commit();
      
      return res.status(200).json({ 
        success: true, 
        message: '病歷已封存', 
        data: updatedPatient 
      });
    }
    
    // 當 isArchived = false，直接刪除病歷
    const [result] = await connection.execute(
      `DELETE FROM patient WHERE id = ?`,
      [patientId]
    );
    
    // Check if the delete affected any rows
    const affectedRows = (result as mysql.ResultSetHeader).affectedRows;
    
    if (affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false, 
        err: '找不到指定病歷',
        data: null
      });
    }
    
    await connection.commit();
    
    return res.status(200).json({
      success: true,
      message: '病歷已刪除',
      data: null
    });
    
  } catch (err: unknown) {
    // Rollback transaction in case of error
    if (connection) {
      await connection.rollback();
    }
    
    console.error('Manage patient status error:', err);
    return res.status(500).json({
      success: false,
      err: `內部錯誤: ${(err as Error).message}`,
      data: null
    });
  } finally {
    // Close the connection
    if (connection) {
      await connection.end();
    }
  }
};