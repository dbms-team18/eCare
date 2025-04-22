import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

// Create a new patient (caregiver only)
export const createPatient = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { 
      userId, 
      name, 
      age, 
      gender, 
      addr, 
      idNum, 
      nhCardNum,
      emerName,
      emerPhone,
      info
    } = req.body;
    
    // Validate required fields
    if (!userId || !name || !age || !gender || !addr || !idNum || !nhCardNum) {
      return res.status(400).json({
        success: false,
        message: '缺少必要資料',
        err: 'Missing required fields'
      });
    }

    // Validate gender values
    if (!['female', 'male', 'other'].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: '性別格式錯誤',
        err: 'Gender must be female, male, or other'
      });
    }

    // Check if patient with same ID number already exists
    const existingPatient = await prisma.patient.findFirst({
      where: { id_number: idNum }
    });

    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: '病患已存在',
        err: 'Patient with this ID number already exists'
      });
    }

    // Create new patient
    const newPatient = await prisma.patient.create({
      data: {
        name,
        age: Number(age),
        gender,
        address: addr,
        id_number: idNum,
        nh_card_number: nhCardNum,
        emergency_contact_name: emerName || null,
        emergency_contact_phone: emerPhone || null,
        condition: info || null,
        created_at: new Date(),
        updated_at: new Date(),
        last_updated_by: userId,
        is_archived: false
      }
    });

    // Create relationship between user and patient
    await prisma.tracking.create({
      data: {
        user_id: Number(userId),
        patient_id: newPatient.patient_id,
        created_at: new Date()
      }
    });

    return res.status(201).json({
      success: true,
      message: '成功新增病患',
      patientId: String(newPatient.patient_id)
    });
  } catch (error) {
    console.error('Create patient error:', error);
    return res.status(500).json({
      success: false,
      message: '新增病患失敗',
      err: error instanceof Error ? error.message : '未知錯誤'
    });
  }
};