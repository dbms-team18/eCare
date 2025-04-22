import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export const managePatientStatus = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, err: 'Method Not Allowed' });
  }

  const { patientId, userId, isArchived } = req.body;

  // 檢查必要欄位
  if (!patientId || !userId || isArchived === undefined) {
    return res.status(400).json({ success: false, err: '缺少必要欄位' });
  }

  try {
    // 當 isArchived = true，標記資料為「封存」
    if (isArchived) {
      const updatedPatient = await prisma.patient.update({
        where: { id: patientId },
        data: {
          isArchived: true,
          lastUpd: new Date().toISOString(),
          lastUpdId: userId,
        },
      });

      return res.status(200).json({ 
success: true, 
message: '病歷已封存', 
data: updatedPatient });
    }

    // 當 isArchived = false，直接刪除病歷
    await prisma.patient.delete({
      where: { id: patientId },
    });

    return res.status(200).json({
      success: true,
      message: '病歷已刪除',
data: null
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      err: `內部錯誤: ${err.message}`,data: null
    });
  }
};
