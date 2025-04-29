import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export const getPatient = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { patientId } = req.query;
  
  // 檢查是否傳入 patientId
  if (!patientId) {
    return res.status(400).json({ success: false, message: '缺少 patientId 參數' });
  }
  
  try {
    // 查詢病患資料
    const patient = await prisma.patient.findUnique({
      where: { id: Number(patientId) },
      select: {
        id: true,
        name: true,
        age: true,
        gender: true,
        addr: true,
        id_number: true,
        nhCardNum: true,
        emerName: true,
        emerPhone: true,
        info: true,
        isArchived: true,
        lastUpd: true,
        lastUpdId: true,
        userId: true
      }
    });
    
    if (!patient) {
      return res.status(404).json({ success: false, message: '病患資料未找到' });
    }
    
    // 直接回傳查詢結果，保持與 getAllPatients 的一致性
    return res.status(200).json({
      success: true,
      message: '取得病患資料成功',
      data: patient
    });
    
  } catch (err: any) {
    return res.status(500).json({ 
      success: false, 
      message: `內部錯誤: ${err.message}` 
    });
  }
};

