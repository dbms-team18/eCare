import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

// Create database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Helper function to create a connection
const getConnection = async () => {
  return await mysql.createConnection(dbConfig);
};

// Create a new patient (caregiver only)
export const createPatient = async (req: NextApiRequest, res: NextApiResponse) => {
  //if (req.method !== 'POST') {
  //  return res.status(405).json({ success: false, err: 'Method Not Allowed' });
  //}

  let connection;

  try {
    const { 
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
    } = req.body;

    // Validate required fields 
    if (!userId || !name || !age || !gender || !addr || !idNum || !nhCardNum) {
      return res.status(400).json({
        success: false,
        message: '缺少必要資料',
        err: 'Missing required fields'
      });
    }

    // Validate gender values
    if (!['female', 'male', 'other'].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: '性別格式錯誤',
        err: 'Gender must be female, male, or other'
      });
    }

    // Create a connection
    connection = await getConnection();
    
    // Start transaction
    await connection.beginTransaction();

    // Check if patient with same ID number already exists
    const [existingPatients] = await connection.execute(
      'SELECT * FROM patient WHERE id_number = ?',
      [idNum]
    );
    
    if (Array.isArray(existingPatients) && existingPatients.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: '病患已存在',
        err: 'Patient with this ID number already exists'
      });
    }

    // Create new patient
    const currentDate = new Date();
    const [result] = await connection.execute(
      `INSERT INTO patient 
      (userId, name, age, gender, addr, id_number, nhCardNum, emerName, emerPhone, info, lastUpd, lastUpdId, isArchived) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(userId),
        name,
        Number(age),
        gender,
        addr,
        idNum,
        nhCardNum,
        emerName || null,
        emerPhone || null,
        info || null,
        currentDate,
        userId,
        false
      ]
    );

    // Get the inserted patient ID
    const patientId = (result as mysql.ResultSetHeader).insertId;

    // Create relationship between user and patient
    await connection.execute(
      `INSERT INTO tracking 
      (userId, patientId, createdAt, permissionLevel, role, roleId) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        Number(userId),
        patientId,
        currentDate,
        1,
        1, // 0:caregiver, 1:family
        1
      ]
    );

    // Commit the transaction
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: '成功新增病患',
      data: { patientId }
    });
  } catch (error) {
    // Rollback transaction in case of error
    if (connection) {
      await connection.rollback();
    }
    
    console.error('Create patient error:', error);
    return res.status(500).json({
      success: false,
      message: '新增病患失敗',
      err: error instanceof Error ? error.message : '未知錯誤'
    }); 
  } finally {
    // Close the connection
    if (connection) {
      await connection.end();
    }
  }
};