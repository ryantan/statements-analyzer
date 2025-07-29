import { Transaction, TransactionRaw } from '@/features/transactions/types';

import { useEffect, useState } from 'react';

import { message } from 'antd';
import { parseJSON } from 'date-fns';

export const useTransactions = () => {
  const [transactions, _setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const setTransactions = (transactions: Transaction[]) => {
    _setTransactions(transactions);
    try {
      localStorage.setItem('transactions', JSON.stringify(transactions));
      message.success('Saved transactions to localStorage');
    } catch (error) {
      console.error('Error saving transactions to localStorage:', error);
      message.error('Failed to save transactions to localStorage');
    }
  };

  const loadFromLocalStorage = () => {
    setLoading(true);
    try {
      const storedTransactions = localStorage.getItem('transactions');
      if (storedTransactions) {
        const rawTransactions = JSON.parse(
          storedTransactions
        ) as TransactionRaw[];
        const parsedTransactions = rawTransactions.map((item) => {
          const date = parseJSON(item.date);
          const accountingDate = item.accountingDate
            ? parseJSON(item.accountingDate)
            : undefined;
          return { ...item, date, accountingDate } as Transaction;
        });
        _setTransactions(parsedTransactions);
        message.success(
          `Loaded ${parsedTransactions.length} transactions from storage`
        );
      } else {
        _setTransactions([]);
        message.info('No transactions found in localStorage');
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      message.error('Failed to load transactions from localStorage');
      _setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  return {
    transactions,
    setTransactions,
    loadFromLocalStorage,
    loading,
  };
};
