// NextJS 相關
import type { NextApiRequest, NextApiResponse } from 'next'

// login 相關
import { compare } from 'bcrypt';

// DB 相關
import { RowDataPacket } from 'mysql2';
import mysqlConnectionPool from "../../../src/lib/mysql"


// 定義 user 資料型別， RowDataPacket 是 mysql2 的資料型別，方便使用
interface UserRow extends RowDataPacket{
  userId: number;
  username: string;
  password: string;
  email: string;
  role: number;
  created_at: string;
}

export const login = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { username, password, role } = req.body;

    // 欄位不可空
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '請輸入帳號或密碼' });
    }
    if (role === undefined || role === null) {
      return res.status(400).json({ success: false, message: '請選擇身份別' });
}

    // 連結 DB 比對
    const connection = await mysqlConnectionPool.getConnection();
    try {
      // 查詢用戶
      const [rows] = await connection.execute<UserRow[]>(
        'SELECT userId, username, password, role FROM user WHERE username = ?',
        [username]
      );
      
      // 創建矩陣存 DB 資料
      const user = rows[0];

      // 無此用戶帳號
      if (!user) {
        return res.status(400).json({ success: false, message: '用戶不存在' });
      }

      // 密碼不符
      const passwordMatch = await compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: '密碼錯誤' });
      }

      // 身份不符
      const numericRole = parseInt(role, 10); // 明確轉為 number
      if (numericRole !== user.role) {
        console.log(numericRole+ '!=='+ user.role)
        return res.status(401).json({ 
          success: false, 
          message: `身份不符` });
}


      // 登入成功，寫 cookie
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // 前端 

      res.setHeader('Set-Cookie', `uid=${user.userId}; Max-Age=43200; Path=/; HttpOnly; SameSite=Lax`);


      return res.status(200).json({
        success: true,
        message: '登入成功',
        uid: user.userId,
        role: user.role, // true = caregiver
      });

    } finally {
      connection.release();
    }
  } catch (err: unknown) {
    let message = '未知錯誤';

    if (err instanceof Error) {
      message = err.message;
    }

    return res.status(500).json({
      success: false,
      message: `內部錯誤: ${message}`,
    });
  }
};




export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method === 'POST') return login(req, res);

  return res.status(405).end();
}

