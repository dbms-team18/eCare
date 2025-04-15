import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { validatePassword } from '@/utils/passwordUtils';

export const signUp = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: '缺少必要字段' });
    }

    const valid = validatePassword(password);
    if (!valid.success) {
      return res.status(400).json({ message: valid.message });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return res.status(400).json({ message: '電子郵件已存在' });

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) return res.status(400).json({ message: '用戶名已存在' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashed,
        emailVerified: false,
      },
    });

    return res.status(200).json({
      profile: {
        uid: user.id,
        email: user.email,
        username: user.username,
        date: user.createdAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: `內部錯誤: ${err}` });
  }
};
