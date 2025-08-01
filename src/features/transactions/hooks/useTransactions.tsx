import {
  Transaction,
  TransactionRaw,
  TransactionResolved,
} from '@/features/transactions/types';
import {
  isNotCCPayments,
  isNotRebates,
} from '@/features/transactions/utils/isNotCCPayments';
import { isNotClaimable } from '@/features/transactions/utils/isNotClaimable';
import { isResolvedTransaction } from '@/features/transactions/utils/isResolvedTransaction';

import { useEffect, useMemo, useState } from 'react';

import { message } from 'antd';
import { parseJSON } from 'date-fns';

export const useTransactions = () => {
  const [transactions, _setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // To be used within useTransactions only!
  const setTransactions = (transactions: Transaction[]) => {
    // Do some checking here to prevent resolved transactions to be used.
    if (transactions.some(isResolvedTransaction)) {
      console.error(
        'You should not be setting resolved transactions to storage.'
      );
      void message.error(
        'You should not be setting resolved transactions to storage.'
      );
      return;
    }

    _setTransactions(transactions);
    try {
      localStorage.setItem('transactions', JSON.stringify(transactions));
      void message.success('Saved transactions to localStorage');
    } catch (error) {
      console.error('Error saving transactions to localStorage:', error);
      void message.error('Failed to save transactions to localStorage');
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
      console.warn('No valid transactions found in the file.');
      void message.warning('No valid transactions found in the file.');
      // return { error: 'No valid transactions found in the file.' };
    }

    if (validTransactions.length !== rawTransactions.length) {
      void message.warning(
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
          void message.error(error).then();
          console.error(error);
          _setTransactions([]);
          return;
        }
        if (!parsedTransactions) {
          void message
            .error('Got undefined response from parseFromString')
            .then();
          console.error('Got undefined response from parseFromString');
          _setTransactions([]);
          return;
        }

        _setTransactions(parsedTransactions);
        console.log(
          `Loaded ${parsedTransactions.length} transactions from storage`
        );
        void message.success(
          `Loaded ${parsedTransactions.length} transactions from storage`
        );

        return parsedTransactions;
      } else {
        _setTransactions([]);
        void message.info('No transactions found in localStorage');
        return [];
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      void message.error('Failed to load transactions from localStorage');
      _setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFromFile = (fileContent: string, append: boolean) => {
    setLoading(true);
    try {
      if (!fileContent) {
        void message.error('Got empty file content').then();
        return;
      }

      const { error, data: parsedTransactions } = parseFromString(fileContent);
      if (error) {
        void message.error(error).then();
        return;
      }
      if (!parsedTransactions) {
        void message
          .error('Got undefined response from parseFromString')
          .then();
        return;
      }

      if (append) {
        setTransactions([...transactions, ...parsedTransactions]);
      } else {
        // Overwrite!
        setTransactions(parsedTransactions);
      }

      message
        .success(`Loaded ${parsedTransactions.length} transactions from file`)
        .then();
    } catch (error) {
      console.error('Error loading transactions:', error);
      void message.error('Failed to load transactions from file');
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

  const addTransaction = (transaction: Transaction) => {
    const newTransactions = [...transactions, transaction];
    setTransactions(newTransactions);
  };

  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  const resolvedTransactions = useMemo<TransactionResolved[]>(() => {
    return transactions.map<TransactionResolved>((transaction) => {
      const resolvedCategoryKey =
        transaction.categoryKey || transaction.autoCategoryKey;
      let parentCategoryKey = 'unknown';
      if (resolvedCategoryKey) {
        parentCategoryKey = resolvedCategoryKey.split('/')[0];
      }
      return {
        ...transaction,
        resolvedCategoryKey,
        parentCategoryKey,
        resolvedDate: transaction.accountingDate || transaction.date,
        isResolved: true,
      };
    });
  }, [transactions]);

  const filteredTransactions = useMemo<TransactionResolved[]>(() => {
    return resolvedTransactions
      .filter(isNotCCPayments)
      .filter(isNotRebates)
      .filter(isNotClaimable);
  }, [resolvedTransactions]);

  return {
    parseFromString,
    loadFromFile,
    loadFromLocalStorage,
    loading,
    updateItem,
    addTransaction,
    setParsedTransactions: setTransactions,

    // Parsed from storage.
    parsedTransactions: transactions,
    // Resolved categories, dates, etc.
    resolvedTransactions,
    // resolvedTransactions with some ignored items filtered.
    transactions: filteredTransactions,
  };
};
