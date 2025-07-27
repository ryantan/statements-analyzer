export type Transaction = {
  key: string;
  day: string;
  month: string;
  date: Date;
  dateFormatted: string;
  description: string[];
  amountFormatted: string;
  amount: number;
};
