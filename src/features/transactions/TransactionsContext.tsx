'use client';

import { Transaction } from '@/features/transactions/types';
import { useTransactions as useTransactionsHook } from '@/features/transactions/useTransactions';

import { ReactNode, createContext, useContext } from 'react';

interface TransactionsContextType {
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  loadTransactions: () => void;
  isLoadingTransactions: boolean;
  updateTransactionItem: (
    key: string,
    updater: (item: Transaction) => Transaction
  ) => void;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(
  undefined
);

interface TransactionsProviderProps {
  children: ReactNode;
}

export function TransactionsProvider({ children }: TransactionsProviderProps) {
  const {
    transactions,
    setTransactions,
    loadFromLocalStorage: loadTransactions,
    loading: isLoadingTransactions,
    updateItem: updateTransactionItem,
  } = useTransactionsHook();

  const value: TransactionsContextType = {
    transactions,
    setTransactions,
    loadTransactions,
    isLoadingTransactions,
    updateTransactionItem,
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error(
      'useTransactions must be used within a TransactionsProvider'
    );
  }
  return context;
}
