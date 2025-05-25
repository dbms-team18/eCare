import { idToCategory } from '@/constants/vitalSignMap';

const bounds: Record<number, { upper: number; lower: number }> = {
  1: { upper: 140, lower: 70 },   // bloodSugar
  2: { upper: 130, lower: 90 },   // systolic
  3: { upper: 80,  lower: 60 },   // diastolic
  4: { upper: 100, lower: 60 },   // heartRate
  5: { upper: 100, lower: 95 },   // bloodO2
  6: { upper: 100, lower: 40 },   // weight
};

export function getAlertMessage(vitalTypeId: number, value: number): string {
  const name = idToCategory[String(vitalTypeId)] || '未知類型';
  const bound = bounds[vitalTypeId];
  if (!bound) return `${name}異常`;

  if (value > bound.upper) return `${name}過高`;
  if (value < bound.lower) return `${name}過低`;
  return `${name}正常`;
}