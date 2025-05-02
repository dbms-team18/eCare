import { NextApiRequest, NextApiResponse } from 'next';
import { getAllPatients } from '@/controllers/patient/getAllPatientController';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { userId } = req.query;
  
  // 檢查是否傳入 userId
  if (!userId) {
    return res.status(400).json({ success: false, error: '缺少 userId 參數' });
  }

  // Handle potential array from query param
  const userIdValue = Array.isArray(userId) ? userId[0] : userId;
  
  try {
    const patients = await getAllPatients(Number(userIdValue));
    
    // 如果沒有找到病患資料
    if (patients.length === 0) {
      return res.status(404).json({ success: false, message: '沒有找到病患資料' });
    }

    return res.status(200).json({
      success: true,
      data: patients
    });
  } catch (err: unknown) {
    console.error('Get all patients error:', err);
    return res.status(500).json({ 
      success: false, 
      message: err instanceof Error ? err.message : String(err)
    });
  }
}