'use client';

import { Category } from '@/features/category/types';
import { AccountingDateCell } from '@/features/transactions/components/AccountingDateCell';
import { useTransactions } from '@/features/transactions/useTransactions';

import { useMemo, useState } from 'react';

import { Modal, Table, Tag } from 'antd';
import { format } from 'date-fns';

import { TransactionForStats } from '../types';

interface DrillDownModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedCategory: string | null;
  categoryMap: Map<string, Category>;
  transactions: TransactionForStats[];
}

export function DrillDownModal({
  isVisible,
  onClose,
  selectedCategory,
  categoryMap,
  transactions,
}: DrillDownModalProps) {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const { updateItem } = useTransactions();

  // Get transactions for selected category
  const selectedCategoryTransactions = useMemo(() => {
    if (!selectedCategory) return [];
    return transactions.filter((t) => t.parentCategoryKey === selectedCategory);
  }, [transactions, selectedCategory]);

  // Reset pagination when category changes
  useMemo(() => {
    if (selectedCategory) {
      setPagination({
        current: 1,
        pageSize: 10,
      });
    }
  }, [selectedCategory]);

  const handleClose = () => {
    setPagination({
      current: 1,
      pageSize: 10,
    });
    onClose();
  };

  // Handler for accounting date changes
  const handleAccountingDateChange = (
    transactionKey: string,
    accountingDate: Date | undefined
  ) => {
    updateItem(transactionKey, (item) => ({
      ...item,
      accountingDate,
      accountingYear: accountingDate ? accountingDate.getFullYear() : undefined,
      accountingMonth: accountingDate
        ? accountingDate.getMonth() + 1
        : undefined,
      accountingDay: accountingDate ? accountingDate.getDate() : undefined,
    }));
  };

  return (
    <Modal
      title={`Transactions for ${
        selectedCategory
          ? categoryMap.get(selectedCategory)?.name || 'Unknown'
          : ''
      }`}
      open={isVisible}
      onCancel={handleClose}
      footer={null}
      width={1000}
      // height="80vh"
    >
      <Table
        key={selectedCategory} // Force table to reset when category changes
        dataSource={selectedCategoryTransactions}
        columns={[
          {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date: Date) => format(date, 'MMM dd, yyyy'),
            sorter: (a: TransactionForStats, b: TransactionForStats) =>
              a.date.getTime() - b.date.getTime(),
          },
          {
            title: 'Accounting Period',
            dataIndex: 'accountingDate',
            key: 'accountingDate',
            width: 140,
            align: 'center' as const,
            render: (
              accountingDate: Date | undefined,
              record: TransactionForStats
            ) => (
              <AccountingDateCell
                transaction={record}
                onAccountingDateChange={handleAccountingDateChange}
              />
            ),
          },
          {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (description: string[]) => description.join(' '),
            ellipsis: true,
          },
          {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => (
              <span
                style={{
                  color: amount >= 0 ? 'green' : 'red',
                  fontWeight: 'bold',
                }}
              >
                ${amount.toFixed(2)}
              </span>
            ),
            defaultSortOrder: 'descend',
            sorter: (a: TransactionForStats, b: TransactionForStats) =>
              a.amount - b.amount,
          },
          {
            title: 'Category',
            dataIndex: 'categoryKey',
            key: 'categoryKey',
            render: (
              categoryKey: string | undefined,
              record: TransactionForStats
            ) => {
              const key = categoryKey || record.autoCategoryKey;
              const category = categoryMap.get(key || '');
              return category ? (
                <Tag color={category.color}>{category.name}</Tag>
              ) : (
                <Tag>Unknown</Tag>
              );
            },
          },
          {
            title: 'Remarks',
            dataIndex: 'remarks',
            key: 'remarks',
            render: (remarks: string | undefined) => remarks || '-',
            ellipsis: true,
          },
        ]}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} transactions`,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, pageSize) => {
            setPagination({
              current: page,
              pageSize: pageSize || 10,
            });
          },
        }}
        rowKey="key"
        scroll={{ x: 800, y: '60vh' }}
      />
    </Modal>
  );
}
