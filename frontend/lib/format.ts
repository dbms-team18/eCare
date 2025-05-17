import dayjs from 'dayjs';

export function formatCreateDate(create_date: number | string): string {
  // 假設 create_date 是 202505161150 這種格式
  const str = String(create_date);
  // 轉成 dayjs 能解析的格式
  const date = dayjs(str, 'YYYYMMDDHHmm');
  if (!date.isValid()) return String(create_date);
  return date.format('YYYY年MM月DD日HH:mm');
}