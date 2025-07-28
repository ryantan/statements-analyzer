import { Transaction } from '@/features/transactions/types';

export const isNotCCPayments = (transaction: Transaction) =>
  !transaction.description
    .join(' ')
    .toUpperCase()
    .includes('FAST INCOMING PAYMENT');
