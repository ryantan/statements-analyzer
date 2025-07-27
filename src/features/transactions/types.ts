export type Transaction = {
  key: string;
  day: string;
  month: string;
  date: Date;
  dateFormatted: string;
  description: string[];
  amountFormatted: string;
  amount: number;
  categoryKey?: string;
  autoCategoryKey?: string;
  remarks?: string;
};

export type TransactionDisplayItem = Transaction & {
  searchText: string;
  resolvedCategoryKey: string | undefined;
};
