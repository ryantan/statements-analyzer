import { Transaction } from '@/features/transactions/types';

export type CategoryStats = {
  categoryKey: string;
  categoryName: string;
  total: number;
  transactionCount: number;
  averageAmount: number;
  monthlyBreakdown: Record<string, number>;
};

export type PieData = {
  name: string;
  color: string;
  value: number;
  transactionsCount: number;
  key: string;
};

export type TransactionForStats = Transaction & {
  parentCategoryKey: string;
  resolvedDate: Date;
};
