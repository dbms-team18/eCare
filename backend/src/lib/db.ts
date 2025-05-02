import mysql, { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Function to get a connection from the pool
export async function getConnection(): Promise<PoolConnection> {
  return await pool.getConnection();
}

// User interface based on your schema
export interface User extends RowDataPacket {
  userId: number;
  username: string;
  password: string;
  email: string;
  role: number; // 0:caregiver, 1:family
  created_at: Date;
}

// Patient interface based on your schema
export interface Patient extends RowDataPacket {
  patientId: number;
  name: string;
  age: number;
  gender: string;
  addr: string;
  idNum: string;
  nhCardNum: string;
  emerName: string | null;
  emerPhone: string | null;
  info: string | null;
  lastUpd: Date;
  lastUpdId: number | null;
  isArchived: boolean;
}

// Type-safe execute query function
export async function executeQuery<T extends RowDataPacket[]>(
  sql: string, 
  params: Array<string | number | boolean | null | undefined | Date> = []
): Promise<T> {
  const [rows] = await pool.execute<T>(sql, params);
  return rows;
}

// Type-safe execute for modifications (INSERT, UPDATE, DELETE)
export async function executeModification(
  sql: string, 
  params: Array<string | number | boolean | null | undefined | Date> = []
): Promise<ResultSetHeader> {
  const [result] = await pool.execute<ResultSetHeader>(sql, params);
  return result;
}

// Get a user by ID
export async function getUserById(userId: number): Promise<User | null> {
  const users = await executeQuery<User[]>(
    'SELECT * FROM User WHERE userId = ?',
    [userId]
  );
  return users.length > 0 ? users[0] : null;
}

// Get a patient by ID and user ID
export async function getPatientById(patientId: number, userId?: number): Promise<Patient | null> {
  let sql = 'SELECT * FROM Patient WHERE patientId = ?';
  const params: Array<number> = [patientId];
  
  if (userId !== undefined) {
    sql += ' AND lastUpdId = ?';
    params.push(userId);
  }
  
  const patients = await executeQuery<Patient[]>(sql, params);
  return patients.length > 0 ? patients[0] : null;
}

// Update a patient
export async function updatePatient(
  patientId: number,
  updates: Partial<Omit<Patient, 'patientId' | 'lastUpd'>>,
  userId: number
): Promise<boolean> {
  // Create SET clause and parameters
  const setEntries = Object.entries(updates)
    .filter(([, value]) => value !== undefined);
  
  if (setEntries.length === 0) {
    return false; // Nothing to update
  }
  
  const setClauses = setEntries.map(([key]) => `${key} = ?`);
  // Add automatic lastUpdId
  setClauses.push('lastUpdId = ?');
  
  const params: Array<string | number | boolean | null | Date> = [
    ...setEntries.map(([, value]) => value),
    userId
  ];
  
  // Add WHERE parameter
  params.push(patientId);
  
  const sql = `
    UPDATE Patient 
    SET ${setClauses.join(', ')}
    WHERE patientId = ?
  `;
  
  const result = await executeModification(sql, params);
  return result.affectedRows > 0;
}

// Create a new patient
export async function createPatient(
  patient: Omit<Patient, 'patientId' | 'lastUpd' | 'isArchived'>,
  userId: number
): Promise<number> {
  const fields = Object.keys(patient).join(', ');
  const placeholders = Array(Object.keys(patient).length).fill('?').join(', ');
  
  const sql = `
    INSERT INTO Patient (${fields}, lastUpdId)
    VALUES (${placeholders}, ?)
  `;
  
  const params = [
    ...Object.values(patient),
    userId
  ];
  
  const result = await executeModification(sql, params);
  return result.insertId;
}

// Get all patients for a user
export async function getPatientsByUser(userId: number, includeArchived: boolean = false): Promise<Patient[]> {
  let sql = 'SELECT * FROM Patient WHERE lastUpdId = ?';
  
  if (!includeArchived) {
    sql += ' AND isArchived = FALSE';
  }
  
  return await executeQuery<Patient[]>(sql, [userId]);
}

// Archive a patient
export async function archivePatient(patientId: number, userId: number): Promise<boolean> {
  const sql = `
    UPDATE Patient
    SET isArchived = TRUE, lastUpdId = ?
    WHERE patientId = ?
  `;
  
  const result = await executeModification(sql, [userId, patientId]);
  return result.affectedRows > 0;
}

// User authentication
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  // NOTE: In a real application, you should use proper password hashing!
  const users = await executeQuery<User[]>(
    'SELECT * FROM User WHERE email = ? AND password = ?',
    [email, password]
  );
  
  return users.length > 0 ? users[0] : null;
}

// Create a new user
export async function createUser(
  username: string,
  password: string,
  email: string,
  role: number
): Promise<number> {
  // NOTE: In a real application, you should hash the password!
  const sql = `
    INSERT INTO User (username, password, email, role)
    VALUES (?, ?, ?, ?)
  `;
  
  const result = await executeModification(sql, [username, password, email, role]);
  return result.insertId;
}