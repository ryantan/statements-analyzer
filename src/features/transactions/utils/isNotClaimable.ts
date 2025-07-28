import { Transaction } from '@/features/transactions/types';

export const isNotClaimable = (transaction: Transaction) =>
  transaction.claimable !== true;

export const isClaimable = (transaction: Transaction) =>
  transaction.claimable === true;
