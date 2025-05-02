import { RowDataPacket } from 'mysql2/promise';
import { executeQuery, executeModification } from '@/lib/db';

interface PatientData {
  userId: number;
  name: string;
  age: number;
  gender: string;
  addr: string;
  idNum: string;
  nhCardNum: string;
  emerName?: string | null;
  emerPhone?: string | null;
  info?: string | null;
}

export const createPatient = async (patientData: PatientData): Promise<number> => {
  // Validate gender values
  if (!['female', 'male', 'other'].includes(patientData.gender)) {
    throw new Error('Gender must be female, male, or other');
  }

  // Check if patient with same ID number already exists
  const existingPatients = await executeQuery<RowDataPacket[]>(
    'SELECT * FROM patient WHERE id_number = ?',
    [patientData.idNum]
  );
  
  if (existingPatients.length > 0) {
    throw new Error('Patient with this ID number already exists');
  }

  // Begin transaction using executeModification with transaction
  try {
    // Create new patient
    const currentDate = new Date();
    const result = await executeModification(
      `INSERT INTO patient 
      (userId, name, age, gender, addr, id_number, nhCardNum, emerName, emerPhone, info, lastUpd, lastUpdId, isArchived) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientData.userId,
        patientData.name,
        patientData.age,
        patientData.gender,
        patientData.addr,
        patientData.idNum,
        patientData.nhCardNum,
        patientData.emerName || null,
        patientData.emerPhone || null,
        patientData.info || null,
        currentDate,
        patientData.userId,
        false
      ]
    );

    // Get the inserted patient ID
    const patientId = result.insertId;

    // Create relationship between user and patient
    await executeModification(
      `INSERT INTO tracking 
      (userId, patientId, createdAt, permissionLevel, role, roleId) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        patientData.userId,
        patientId,
        currentDate,
        1,
        1, // 0:caregiver, 1:family
        1
      ]
    );

    return patientId;
  } catch (error) {
    // Re-throw the error to be handled by the API route
    throw error;
  }
};