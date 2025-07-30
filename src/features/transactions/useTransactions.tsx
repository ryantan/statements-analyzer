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

  // Accepts a string containing JSON data and returns an array of transactions.
  const parseFromString = (
    content: string
  ):
    | { error: string; data?: Transaction[] }
    | { error?: string; data: Transaction[] } => {
    const rawTransactions = JSON.parse(content) as TransactionRaw[];

    // Validate that the imported data is an array
    if (!Array.isArray(rawTransactions)) {
      return {
        error: 'Invalid file format. Expected an array of transactions.',
      };
    }

    // Basic validation of transaction structure
    const isValidTransaction = (transaction: TransactionRaw) => {
      return (
        transaction &&
        typeof transaction === 'object' &&
        transaction.key &&
        transaction.date &&
        typeof transaction.amount === 'number'
      );
    };

    const validTransactions = rawTransactions.filter(isValidTransaction);
    if (validTransactions.length === 0) {
      return { error: 'No valid transactions found in the file.' };
    }

    if (validTransactions.length !== rawTransactions.length) {
      message.warning(
        `${rawTransactions.length - validTransactions.length} invalid transactions were skipped.`
      );
    }

    const parsedTransactions = rawTransactions.map((item) => {
      const date = parseJSON(item.date);
      const accountingDate = item.accountingDate
        ? parseJSON(item.accountingDate)
        : undefined;
      return { ...item, date, accountingDate } as Transaction;
    });

    return { data: parsedTransactions };
  };

  const loadFromLocalStorage = () => {
    setLoading(true);
    try {
      const storedTransactions = localStorage.getItem('transactions');
      if (storedTransactions) {
        const { error, data: parsedTransactions } =
          parseFromString(storedTransactions);
        if (error) {
          message.error(error).then();
          _setTransactions([]);
          return;
        }
        if (!parsedTransactions) {
          message.error('Got undefined response from parseFromString').then();
          _setTransactions([]);
          return;
        }

        _setTransactions(parsedTransactions);
        message.success(
          `Loaded ${parsedTransactions.length} transactions from storage`
        );

        return parsedTransactions;
      } else {
        _setTransactions([]);
        message.info('No transactions found in localStorage');
        return [];
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      message.error('Failed to load transactions from localStorage');
      _setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFromFile = (fileContent: string) => {
    setLoading(true);
    try {
      if (!fileContent) {
        message.error('Got empty file content').then();
        return;
      }

      const { error, data: parsedTransactions } = parseFromString(fileContent);
      if (error) {
        message.error(error).then();
        return;
      }
      if (!parsedTransactions) {
        message.error('Got undefined response from parseFromString').then();
        return;
      }

      setTransactions(parsedTransactions);
      message
        .success(`Loaded ${parsedTransactions.length} transactions from file`)
        .then();
    } catch (error) {
      console.error('Error loading transactions:', error);
      message.error('Failed to load transactions from file');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (
    key: string,
    updater: (item: Transaction) => Transaction
  ) => {
    const newTransactions = transactions.map((item) => {
      if (item.key === key) {
        return updater(item);
      }
      return item;
    });
    setTransactions(newTransactions);
  };

  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  return {
    transactions,
    setTransactions,
    parseFromString,
    loadFromFile,
    loadFromLocalStorage,
    loading,
    updateItem,
  };
};
