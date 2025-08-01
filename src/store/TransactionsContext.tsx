'use client';

import { useTransactions as useTransactionsHook } from '@/features/transactions/hooks/useTransactions';
import {
  Transaction,
  TransactionResolved,
} from '@/features/transactions/types';

import { ReactNode, createContext, useContext } from 'react';

interface StoreContextType {
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

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
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

  const value: StoreContextType = {
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
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
