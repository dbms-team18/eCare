import type { NextApiRequest, NextApiResponse } from 'next'

export const logout = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // 清除登入 cookie：uid
    res.setHeader('Set-Cookie', 'uid=; Max-Age=0; Path=/; HttpOnly');

    return res.status(200).json({
      success: true,
      message: '登出成功',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '未知錯誤';

    return res.status(500).json({
      success: false,
      message: `內部錯誤: ${message}`,
    });
  }
};


export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') return logout(req, res)
  return res.status(405).end()
}
