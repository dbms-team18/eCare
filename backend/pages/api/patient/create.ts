// For Next.js
import { NextApiRequest, NextApiResponse } from "next";
// For MySQL2
import { ResultSetHeader } from "mysql2/promise";
import mysqlConnectionPool from "../../../src/lib/mysql";
import { parse } from "cookie";

// Type for the patient data
type PatientData = {
  userId: number;
  name: string;
  age: number;
  gender: string;
  addr: string;
  idNum: string;
  nhCardNum: string;
  emerName: string;
  emerPhone: string;
  info: string;
  lastUpd: string;
  lastUpdId: number;
  isArchived: boolean;
};

// The function to create a patient in the database
async function createPatient(patientData: PatientData): Promise<number> {
  // Check if patient with this ID number already exists for this user (only if idNum is provided)
  if (patientData.idNum && patientData.idNum.trim() !== "") {
    const [existingPatients] = await mysqlConnectionPool.execute(
      "SELECT patientId FROM patient WHERE idNum = ? AND userId = ? AND isArchived = FALSE",
      [patientData.idNum, patientData.userId]
    );

    if (Array.isArray(existingPatients) && existingPatients.length > 0) {
      throw new Error("Patient with this ID number already exists");
    }
  }

  // Insert the patient into the database
  const [result] = (await mysqlConnectionPool.execute(
    `INSERT INTO patient (
        userId, patientId,name, age, gender, addr, idNum, nhCardNum, 
        emerName, emerPhone, info, lastUpd, lastUpdId, isArchived
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
    [
      patientData.userId,
      null, // patientId will be auto-incremented
      patientData.name,
      patientData.age,
      patientData.gender,
      patientData.addr,
      patientData.idNum,
      patientData.nhCardNum,
      patientData.emerName || null,
      patientData.emerPhone || null,
      patientData.info || null,
      patientData.userId || null, // lastUpdId
      false, // Using 0 or false for isArchived
    ]
  )) as [ResultSetHeader, unknown];

  // Return the ID of the newly created patient
  return result.insertId;
}

// Main API handler
export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  // 跨域設定
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }

  // 從 cookie 取得 uid
  const cookieHeader = req.headers.cookie;
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const uid = cookies.uid;

  // 檢查 uid 是否存在
  if (!uid) {
    return res
      .status(401)
      .json({ success: false, message: "未登入或缺少 uid cookie" });
  }
  try {
    // Parse the request body
    const {
      name,
      age,
      gender,
      addr,
      idNum,
      nhCardNum,
      emerName,
      emerPhone,
      info,
      lastUpd,
      lastUpdId,
      isArchived,
    } = req.body;

    // Validate required fields
    if (!name || !age || !gender || !addr || !idNum || !nhCardNum) {
      return res.status(400).json({
        success: false,
        message: "缺少必要資料",
        error: "Missing required fields",
      });
    }

    // Call the controller function
    const patientId = await createPatient({
      userId: Number(uid), // Assuming userId is passed in the request body
      name,
      age: Number(age),
      gender,
      addr,
      idNum,
      nhCardNum,
      emerName,
      emerPhone,
      info,
      lastUpd,
      lastUpdId,
      isArchived,
    });

    return res.status(201).json({
      success: true,
      message: "成功新增病患",
      data: { patientId },
    });
  } catch (error) {
    console.error("Create patient error:", error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message === "Patient with this ID number already exists") {
        return res.status(409).json({
          success: false,
          message: "病患已存在",
          error: error.message,
        });
      }
    }

    // General error case
    return res.status(500).json({
      success: false,
      message: "新增病患失敗",
      error: error instanceof Error ? error.message : "未知錯誤",
    });
  }
}
