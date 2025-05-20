import { Timestamp } from "next/dist/server/lib/cache-handlers/types";

// frontend/types/api.ts
export interface VitalSignRecord {
  signID: string; // unique identifier for the record
  userId: string;
  patientID: string;
  vitalTypeId: number; // 1-5
  bloodSugar?: number; //1-血壓
  systolic?: number; //2-收縮壓
  diastolic?: number; //3-舒張壓
  heartRate?: number;  //4-心跳
  bloodO2?: number; //5-血氧
  weight?: number;  //6-體重
  create_date: Timestamp ; // timestamp, e.g. "202405171030"
  comment?: string; // optional
}