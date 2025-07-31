'use client';

import {
  Transaction,
  TransactionResolved,
} from '@/features/transactions/types';
import { useTransactions as useTransactionsHook } from '@/features/transactions/useTransactions';

import { ReactNode, createContext, useContext } from 'react';

interface TransactionsContextType {
  loadTransactions: () => void;
  loadFromFile: (fileContent: string, append: boolean) => void;
  isLoadingTransactions: boolean;
  updateTransactionItem: (
    key: string,
    updater: (item: Transaction) => Transaction
  ) => void;
  addTransaction: (transaction: Transaction) => void;
  setParsedTransactions: (transactions: Transaction[]) => void;

  // Closest to storage, with only dates parsed.
  parsedTransactions: Transaction[];
  // With category, parent category and dates resolved.
  resolvedTransactions: TransactionResolved[];
  // resolvedTransactions, with some ignored items filtered.
  transactions: TransactionResolved[];
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(
  undefined
);

interface TransactionsProviderProps {
  children: ReactNode;
}

export function TransactionsProvider({ children }: TransactionsProviderProps) {
  const {
    loadFromLocalStorage: loadTransactions,
    loadFromFile,
    loading: isLoadingTransactions,
    updateItem: updateTransactionItem,
    addTransaction,
    setParsedTransactions,

    parsedTransactions,
    resolvedTransactions,
    transactions,
  } = useTransactionsHook();

  const value: TransactionsContextType = {
    loadTransactions,
    loadFromFile,
    isLoadingTransactions,
    updateTransactionItem,
    addTransaction,
    setParsedTransactions,

    parsedTransactions,
    resolvedTransactions,
    transactions,
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
