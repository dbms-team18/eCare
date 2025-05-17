export const idToCategory: Record<string, string> = {
    // 英文 id
    'bloodSugar': '血糖',
    'systolic': '血壓-收縮壓',
    'diastolic': '血壓-舒張壓',
    'heartRate': '心跳',
    'bloodO2': '血氧',
    'weight': '體重',
    // 數字 id
    '1': '血糖',
    '2': '血壓-收縮壓',
    '3': '血壓-舒張壓',
    '4': '心跳',
    '5': '血氧',
    '6': '體重',
};

export const vitalTypeOptions = [
  { id: 1, name: '血糖' },
  { id: 2, name: '血壓-收縮壓' },
  { id: 3, name: '血壓-舒張壓' },
  { id: 4, name: '心跳' },
  { id: 5, name: '血氧' },
  { id: 6, name: '體重' },
];

export const unitMap: Record<number, string> = {
  1: 'mg/dL',
  2: 'mmHg',
  3: 'mmHg',
  4: 'bpm',
  5: '%',
  6: 'kg',
};

export const iconMap: Record<number, string> = {
  1: '🩸',     // 血糖
  2: '⬇️',     // 收縮壓
  3: '↔️',     // 舒張壓
  4: '❤️',     // 心跳
  5: '🫧',     // 血氧
  6: '👣',     // 體重
};