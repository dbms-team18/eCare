import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt';
import { validatePassword } from '@/utils/passwordUtils';
// DB 相關
import type { ResultSetHeader } from 'mysql2';
import { RowDataPacket } from 'mysql2';
import mysqlConnectionPool from "../../../src/lib/mysql"


// 定義 user 資料型別
interface UserRow extends RowDataPacket{
  userId: number;
  username: string;
  password: string;
  email: string;
  role: number;
  created_at: string;
}

export const signUp = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end();

  // 接收前端傳來的註冊資料
  const { username, password, email, role} = req.body;

  // role 轉為 int
  const numericRole = parseInt(role, 10);

  //檢測必填字段
  if (!email || !username || !password || isNaN(numericRole)) {
    return res.status(400).json({ message: '缺少必填字段' });
  }

  const valid = validatePassword(password);
  if (!valid.success) {
    return res.status(400).json({ message: valid.message });
  }

  try {
    const connection = await mysqlConnectionPool.getConnection();
    try {
      // 檢查 email 是否存在
      const [emailRows] = await connection.execute<UserRow[]>(
        'SELECT * FROM user WHERE email = ? LIMIT 1',
        [email]
      );
      if (emailRows.length > 0) {
        return res.status(400).json({ message: '電子郵件已存在' });
      }


      // 檢查 username 是否存在
      const [nameRows] = await connection.execute<UserRow[]>(
        'SELECT * FROM user WHERE username = ? LIMIT 1',
        [username]
      );
      if (nameRows.length > 0) {
        return res.status(400).json({ message: '用戶名已存在' });
      }

      // 加密密碼
      const hashedPassword = await bcrypt.hash(password, 10);

      // 新增使用者
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO user (username, email, password, role, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [username, email, hashedPassword, numericRole]
      );

      const insertId = result.insertId;

      return res.status(200).json({
        profile: {
          uid: insertId,
          email:email,
          username:username,
          date: new Date().toISOString(), // 這邊可以再進一步 select created_at
        },
      });
    } finally {
      connection.release();
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知錯誤';
    return res.status(500).json({ message: `內部錯誤: ${message}` });
  }
};



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 設定允許跨域來源 前端 :3000
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); 
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // 如果是預檢請求（由瀏覽器自動發出）
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 處理實際 POST 請求
  if (req.method === 'POST') return signUp(req, res);

  return res.status(405).end();
}

