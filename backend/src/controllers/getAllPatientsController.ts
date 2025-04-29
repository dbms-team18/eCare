import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export const getAllPatients = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, err: 'Method Not Allowed' });
  }

  const { userId } = req.query;

  // 檢查是否傳入 userId
  if (!userId) {
    return res.status(400).json({ success: false, err: '缺少 userId 參數' });
  }

  try {
    // 查詢所有該 userId 管理的病患
    const patients = await prisma.patient.findMany({
      where: { userId: Number(userId) },
      select: {
        id:true,
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
      },
    orderBy: { name: 'asc'} // Order by name alphabetically 
    },);


    // 如果沒有找到病患資料
    if (!patients || patients.length === 0) {
      return res.status(404).json({ success: false, message: '沒有找到病患資料' });
    }

    return res.status(200).json({
      success: true,
      data: patients
    });
  } catch (err: any) {
   return res.status(404).json({ 
success: false, 
message: '病患資料未找到' 
});
  }
};
