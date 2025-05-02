// controllers/patient/getAllPatientsController.ts
import { RowDataPacket } from 'mysql2/promise';
import { executeQuery } from '@/lib/db';

interface PatientRow extends RowDataPacket {
  id: number;
  name: string;
  age: number;
  gender: string;
  addr: string;
  id_number: string;
  nhCardNum: string;
  emerName: string | null;
  emerPhone: string | null;
  info: string | null;
  isArchived: boolean;
  lastUpd: Date;
}

export const getAllPatients = async (userId: number): Promise<PatientRow[]> => {
  try {
    // Use the centralized database utility
    const patients = await executeQuery<PatientRow[]>(
      `SELECT 
        id, 
        name, 
        age, 
        gender, 
        addr, 
        id_number, 
        nhCardNum, 
        emerName, 
        emerPhone, 
        info, 
        isArchived, 
        lastUpd 
      FROM patient 
      WHERE userId = ? 
      ORDER BY name ASC`, 
      [userId]
    );
    
    return patients;
  } catch (error) {
    // Re-throw the error to be handled by the API route
    throw error;
  }
};