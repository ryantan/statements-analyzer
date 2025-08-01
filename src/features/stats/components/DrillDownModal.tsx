'use client';

import { Category } from '@/features/categories/types';
import { AccountingDateCell } from '@/features/transactions/components/AccountingDateCell';
import { useStore } from '@/store/TransactionsContext';

import { useMemo, useState } from 'react';

import { Modal, Table, Tag, Typography } from 'antd';
import { format } from 'date-fns';

import { TransactionForStats } from '../types';

const { Text } = Typography;

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
  const { updateTransactionItem } = useStore();

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
    updateTransactionItem(transactionKey, (item) => ({
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
            width: 140,
            render: (date: Date) => format(date, 'MMM dd, yyyy'),
            sorter: (a: TransactionForStats, b: TransactionForStats) =>
              a.date.getTime() - b.date.getTime(),
          },
          {
            title: 'Accounting Period',
            dataIndex: 'accountingDate',
            key: 'accountingDate',
            width: 160,
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
            width: 320,
            render: (description: string[]) => (
              <Text copyable className="whitespace-normal">
                {description.join(' ')}
              </Text>
            ),
            ellipsis: true,
          },
          {
            title: 'Category',
            dataIndex: 'categoryKey',
            key: 'categoryKey',
            width: 200,
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
            width: 200,
            render: (remarks: string | undefined) => remarks || '-',
            ellipsis: true,
          },
          {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            fixed: 'right',
            width: 128,
            render: (amount: number) => (
              <span className="font-bold">${amount.toFixed(2)}</span>
            ),
            defaultSortOrder: 'descend',
            sorter: (a: TransactionForStats, b: TransactionForStats) =>
              a.amount - b.amount,
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
        scroll={{ x: 'max-context', y: '60vh' }}
      />
    </Modal>
  );
}
