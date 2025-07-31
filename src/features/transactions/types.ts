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
  // Bank and file tracking properties
  bank?: string;
  bankAccount?: string;
  fileName?: string;
};

export type TransactionRaw = Omit<Transaction, 'date' | 'accountingDate'> & {
  date: string;
  accountingDate?: string;
};

export type TransactionResolved = Transaction & {
  resolvedCategoryKey: string | undefined;
  parentCategoryKey: string;
  resolvedDate: Date;
  isResolved: boolean;
};

export type TransactionDisplayItem = TransactionResolved & {
  searchText: string;
};
