import type { NextApiRequest, NextApiResponse } from 'next'
import { createPool } from 'mysql2/promise';
import { compare } from 'bcrypt';


export const login = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '請輸入帳號或密碼' });
    }

    const connection = await pool.getConnection();
    try {
      // 查詢用戶
      const [rows] = await connection.execute<[{ 
        userId: number, 
        username: string,
        password: string, 
        role: number }]>(
        'SELECT userId, username, password, role FROM user WHERE username = ?',
        [username]
      );
      
      // 創建矩陣存資料
      const user = rows[0];

      // 無此帳號
      if (!user) {
        return res.status(400).json({ success: false, message: '用戶不存在' });
      }

      // 密碼不符
      const passwordMatch = await compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ success: false, message: '密碼錯誤' });
      }

      // 登入成功，寫 cookie
      res.setHeader('Set-Cookie', `uid=${user.userId}; Max-Age=${60 * 60 * 12}; Path=/`);

      return res.status(200).json({
        success: true,
        message: '登入成功',
        uid: user.userId,
        role: user.role === 0, // true = caregiver
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





export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') return login(req, res)
  return res.status(405).end()
}
