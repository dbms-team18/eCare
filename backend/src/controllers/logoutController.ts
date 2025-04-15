import { NextApiRequest, NextApiResponse } from 'next';

export const logout = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // 清除 cookie（模擬 sessionid）
    res.setHeader('Set-Cookie', 'uid=; Max-Age=0; Path=/');

    return res.status(200).json({
      status: 200,
      success: true,
      message: '登出成功',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: `內部錯誤: ${err.message}`,
    });
  }
};
