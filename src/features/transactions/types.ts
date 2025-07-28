export type Transaction = {
  key: string;
  day: string;
  month: string;
  year: number;
  date: Date;
  dateFormatted: string;
  description: string[];
  amountFormatted: string;
  amount: number;
  categoryKey?: string;
  autoCategoryKey?: string;
  remarks?: string;
  claimable?: boolean;
};

export type TransactionRaw = Omit<Transaction, 'date'> & {
  date: string;
};

export type TransactionDisplayItem = Transaction & {
  searchText: string;
  resolvedCategoryKey: string | undefined;
};
