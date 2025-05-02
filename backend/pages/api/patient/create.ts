//import type { NextApiRequest, NextApiResponse } from "next";
import { NextApiRequest, NextApiResponse } from 'next';
import { createPatient } from '@/controllers/patient/createPatientController';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

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
      info,
    } = req.body;

    // Validate required fields 
    if (!userId || !name || !age || !gender || !addr || !idNum || !nhCardNum) {
      return res.status(400).json({
        success: false,
        message: '缺少必要資料',
        error: 'Missing required fields'
      });
    }

    // Call the controller function
    const patientId = await createPatient({
      userId: Number(userId),
      name,
      age: Number(age),
      gender,
      addr,
      idNum,
      nhCardNum,
      emerName,
      emerPhone,
      info
    });

    return res.status(201).json({
      success: true,
      message: '成功新增病患',
      data: { patientId }
    });
  } catch (error) {
    console.error('Create patient error:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message === 'Patient with this ID number already exists') {
        return res.status(409).json({
          success: false,
          message: '病患已存在',
          error: error.message
        });
      }
      
      if (error.message === 'Gender must be female, male, or other') {
        return res.status(400).json({
          success: false,
          message: '性別格式錯誤',
          error: error.message
        });
      }
    }
    
    // General error case
    return res.status(500).json({
      success: false,
      message: '新增病患失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }); 
  }
}