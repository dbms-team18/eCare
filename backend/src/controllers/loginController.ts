import { prisma } from '@/lib/prisma';
import { compare } from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';


export const login = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '請輸入帳號或密碼' });
    }

    const user = await prisma.user.findUnique({ where: { name:username } });

    if (!user) {
      return res.status(400).json({ success: false, message: '用戶不存在' });
    }

    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: '密碼錯誤' });
    }

    // ✅ 可選：寫入 cookie（模擬登入 session，可改用 JWT 或 iron-session）
    res.setHeader('Set-Cookie', `uid=${user.id}; Max-Age=${60 * 60 * 12}; Path=/`);

    return res.status(200).json({
      success: true,
      message: '登入成功',
      uid: user.id,
      role: user.role === 0, // true = caregiver
    });
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
