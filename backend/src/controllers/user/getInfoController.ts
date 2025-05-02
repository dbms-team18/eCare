import { NextApiRequest, NextApiResponse } from 'next';
import mysql, { RowDataPacket } from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Define the User interface extending RowDataPacket
interface User extends RowDataPacket {
  id: number;
  username: string;
  email: string;
}

export const getUserInfo = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
  }

  const userId = req.query.uid as string;
  
  if (!userId) {
    return res.status(400).json({ status: 'error', message: '缺少用戶ID參數' });
  }

  let connection;

  try {
    // Create a connection
    connection = await mysql.createConnection(dbConfig);
    
    // Query for user by ID with proper typing
    const [users] = await connection.execute<User[]>(
      'SELECT username, email FROM user WHERE id = ?',
      [userId]
    );
    
    if (!users || users.length === 0) {
      return res.status(404).json({ status: 'error', message: '用戶不存在' });
    }

    const user = users[0];

    return res.status(200).json({
      status: 'success',
      data: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (err: unknown) {
    console.error('Get user info error:', err);
    return res.status(500).json({ 
      status: 'error', 
      message: err instanceof Error ? err.message : String(err) 
    });
  } finally {
    // Close the connection
    if (connection) {
      await connection.end();
    }
  }
};