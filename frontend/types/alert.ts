export type Alert = {
　alertID:string;
  alertTrigger: boolean;
  userId: number;
  patientId: string;
  vitalTypeId: number;
  alertInfo?: string;
  timestamp?: number; 
};