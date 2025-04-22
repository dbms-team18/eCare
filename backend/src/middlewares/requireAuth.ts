
//
import { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiHandler } from 'next';

export const requireAuth = (handler: NextApiHandler): NextApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const uid = req.cookies.uid;
    
    if (!uid) {
      return res.status(401).json({ success: false, err: '未登入' });
    }
    
    // Set uid in query params to make it accessible to the handler
    req.query.userId = uid;
    
    // Call the original handler
    return handler(req, res);
  };
};