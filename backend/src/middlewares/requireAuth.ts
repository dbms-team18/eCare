import { NextApiHandler } from 'next';

export const requireAuth = (handler: NextApiHandler) => {
  return async (req, res) => {
    const uid = req.cookies.uid;
    if (!uid) {
      return res.status(401).json({ status: 'error', message: '未登入' });
    }

    // 可選：掛在 req 身上讓 controller 取得
    req.query.uid = uid;
    return handler(req, res);
  };
};
