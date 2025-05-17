import { idToCategory } from '@/constants/vitalSignMap';

export function getAlertMessage(vitalTypeId: number, value: number): string {
  const name = idToCategory[String(vitalTypeId)] || '未知類型';
  if (vitalTypeId === 1) return value > 140 ? `${name}過高` : `${name}過低`;
  if (vitalTypeId === 2) return value > 130 ? `${name}過高` : `${name}過低`;
  if (vitalTypeId === 3) return value > 90 ? `${name}過高` : `${name}過低`;
  if (vitalTypeId === 4) return value > 100 ? `${name}過高` : `${name}過低`;
  if (vitalTypeId === 5) return value < 95 ? `${name}過低` : `${name}過高`;
  if (vitalTypeId === 6) return value > 100 ? `${name}過高` : `${name}過低`;
  return `${name}異常`;
}