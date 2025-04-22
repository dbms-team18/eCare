import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export const readPatient = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, err: 'Method Not Allowed' });
  }

  const { userId, patientId } = req.query;

  // 檢查是否傳入 userId 和 patientId
  if (!userId || !patientId) {
    return res.status(400).json({ success: false, err: '缺少 userId 或 patientId 參數' });
  }

  try {
    // 查詢病患資料，並確認是該使用者管理的病患
    const patient = await prisma.patient.findFirst({
      where: {
        id: String(patientId),
        userId: String(userId),
      },
    });

    if (!patient) {
      return res.status(404).json({ success: false, err: '病患資料未找到' });
    }

    // 回傳病患資料
    const patientInfo = {
      patientId: patient.id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      addr: patient.addr,
      idNum: patient.idNum,
      nhCardNum: patient.nhCardNum,
      emerName: patient.emerName,
      emerPhone: patient.emerPhone,
      info: patient.info,
      isArchived: patient.isArchived,
      lastUpd: patient.lastUpd,
    };

    return res.status(200).json({ success: true, patientData: patientInfo });
  } catch (err: any) {
    return res.status(500).json({ success: false, err: `內部錯誤: ${err.message}` });
  }
};
