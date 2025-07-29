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
  // Accounting date properties for assigning transactions to different periods
  accountingYear?: number;
  accountingMonth?: number;
  accountingDay?: number;
  accountingDate?: Date;
};

export type TransactionRaw = Omit<Transaction, 'date' | 'accountingDate'> & {
  date: string;
  accountingDate?: string;
};

export type TransactionDisplayItem = Transaction & {
  searchText: string;
  resolvedCategoryKey: string | undefined;
};
