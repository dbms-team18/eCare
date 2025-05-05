import type { NextApiRequest, NextApiResponse } from 'next'
import { createPool } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { validatePassword } from '@/utils/passwordUtils';

// 連線池 (建議正式版抽出去 lib/mysql.ts)
const pool = createPool({
  host: 'localhost',
  user: 'root',
  password: 'your_password', // <-- 換成你的密碼
  database: 'vitalsigns',    // <-- 換成你的資料庫
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 定義 user 資料型別
interface UserRow {
  userId: number;
  username: string;
  password: string;
  email: string;
  role: number;
  created_at: string;
}

export const signUp = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: '缺少必填字段' });
  }

  const valid = validatePassword(password);
  if (!valid.success) {
    return res.status(400).json({ message: valid.message });
  }

  try {
    const connection = await pool.getConnection();
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
      const [result] = await connection.execute<{
        insertId: number;
      }>(
        `INSERT INTO user (username, email, password, role, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [username, email, hashedPassword, 0]
      );

      const insertId = (result as any).insertId;

      return res.status(200).json({
        profile: {
          uid: insertId,
          email,
          username,
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



export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') return signUp(req, res)
  return res.status(405).end()
}
