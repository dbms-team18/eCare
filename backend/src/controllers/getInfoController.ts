import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export const getUserInfo = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
  }

  const userId = req.query.uid as string;

  if (!userId) {
    return res.status(400).json({ status: 'error', message: '缺少用戶ID參數' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ status: 'error', message: '用戶不存在' });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};
