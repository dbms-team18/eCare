import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

// Create a new patient (caregiver only)
export const createPatient = async (req: NextApiRequest, res: NextApiResponse) => {

  //if (req.method !== 'POST') {
    //return res.status(405).json({ success: false, err: 'Method Not Allowed' });
  //}

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


    // delete later 測試過的話，表示這邊跑得了
    //週一晚上測試：寫死跑得過(嗎），顯示到114行的success: false, message: '新增病患失敗', 和奇妙的東西
    //const userId = 2;
    //const name = "Test";
    //const age = 100;
    //const gender = "female";
    //const addr="新北市板橋區";
    //const idNum="001";
    //const nhCardNum="123456";
    //const emerName="Test1";
    //const emerPhone="0912345678";
    //const info =""
    
    // Validate required fields 
    if (!userId || !name || !age || !gender || !addr || !idNum || !nhCardNum) {
      return res.status(400).json({
        success: false,
        message: '缺少必要資料',
        err: 'Missing required fields'
      });
    }

    // Validate gender values //有必要嗎？
    if (!['female', 'male', 'other'].includes(gender)) {
      return res.status(400).json({
        success: false,
        message: '性別格式錯誤',
        err: 'Gender must be female, male, or other'
      });
    }

    // Check if patient with same ID number already exists
    const existingPatient = await prisma.patient.findFirst({
      where: { id_number: idNum } //在  schema 中有 id_number  String    @unique 
      //總之是確認有沒有重複patient id?
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
        userId: Number(userId),
        name: name, //不知原因
        age: Number(age),
        gender,
        addr: addr,
        id_number: idNum, 
        nhCardNum: nhCardNum,
        emerName: emerName || null,
        emerPhone: emerPhone || null,
        info: info || null,
        //created_at: new Date(),
        lastUpd: new Date(),
        lastUpdId: userId, 
        isArchived: false

      }
    });

   // Create relationship between user and patient 
   // patient是被user update的,但是在create patient裡怎麼抓userId? 此處method來track
   // 和tracking database有關..?
    await prisma.tracking.create({
      data: {
        userId: Number(userId),
        patientId: newPatient.id, // This should match your schema
        createdAt: new Date(),
        permissionLevel: 1,
        role: 1,  // 0:caregiver, 1:family
        roleId : 1
      }
    });

    return res.status(201).json({
      success: true,
      message: '成功新增病患',
      //patientId: String(newPatient.patient_id)
      data: { patientId: newPatient.id }
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

