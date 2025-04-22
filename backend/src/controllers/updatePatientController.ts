import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
export const updatePatient = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, err: 'Method Not Allowed' });
  }
  const {
    patientId,
    userId,
    name,
    age,
    gender,
    addr,
    emerName,
    emerPhone,
    info
  } = req.body;
  
  // 檢查必要欄位 - 只檢查 patientId 和 userId
  if (!patientId || !userId) {
    return res.status(400).json({ success: false, err: '缺少必要欄位' });
  }
  
  try {
    // 先取得目前病患資料
    const currentPatient = await prisma.patient.findUnique({
      where: { id: patientId }
    });
    
    if (!currentPatient) {
      return res.status(404).json({ success: false, err: '找不到病患資料' });
    }
    
    // 更新病患資料，若沒有提供則使用原有的值
    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        userId,
        name: name || currentPatient.name,
        age: age ? parseInt(age) : currentPatient.age,
        gender: gender || currentPatient.gender,
        addr: addr || currentPatient.addr,
        emerName: emerName || currentPatient.emerName,
        emerPhone: emerPhone || currentPatient.emerPhone,
        info: info !== undefined ? info : currentPatient.info,
        lastUpd: new Date().toISOString(),
        lastUpdId: userId,
      },
    });
    
    return res.status(200).json({
      success: true,
      data: updatedPatient,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      err: `內部錯誤: ${err.message}`,
    });
  }
}
