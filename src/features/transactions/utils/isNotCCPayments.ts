import { Transaction } from '@/features/transactions/types';

export const isNotCCPayments = (transaction: Transaction) => {
  const upperCaseDescriptions = transaction.description.join(' ').toUpperCase();

  if (upperCaseDescriptions.includes('FAST INCOMING PAYMENT')) {
    return false;
  }

  if (upperCaseDescriptions.includes('PAYMENT BY INTERNET')) {
    return false;
  }

  return true;
};

export const isNotRebates = (transaction: Transaction) =>
  !transaction.description.join(' ').toUpperCase().includes('CASH REBATE');
