export const threeCharMonthNames = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];
export function parseDayMonth(day: string, month: string): Date {
  const monthMap: Record<string, number> = {
    JAN: 0,
    FEB: 1,
    MAR: 2,
    APR: 3,
    MAY: 4,
    JUN: 5,
    JUL: 6,
    AUG: 7,
    SEP: 8,
    OCT: 9,
    NOV: 10,
    DEC: 11,
  };

  const dayNum = parseInt(day, 10);
  const monthNum = monthMap[month.toUpperCase()];

  if (isNaN(dayNum) || monthNum === undefined) {
    throw new Error(`Invalid date: ${day} ${month}`);
  }

  const currentYear = new Date().getFullYear();
  return new Date(currentYear, monthNum, dayNum);
}
