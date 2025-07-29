'use client';

import { useMemo, useState } from 'react';
import { Modal, Table, Tag } from 'antd';
import { format } from 'date-fns';
import { TransactionForStats } from '../types';
import { Category } from '@/features/category/types';

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
    pageSize: 20,
  });

  // Get transactions for selected category
  const selectedCategoryTransactions = useMemo(() => {
    if (!selectedCategory) return [];
    return transactions.filter(
      (t) => t.parentCategoryKey === selectedCategory
    );
  }, [transactions, selectedCategory]);

  // Reset pagination when category changes
  useMemo(() => {
    if (selectedCategory) {
      setPagination({
        current: 1,
        pageSize: 20,
      });
    }
  }, [selectedCategory]);

  const handleClose = () => {
    setPagination({
      current: 1,
      pageSize: 20,
    });
    onClose();
  };

  return (
    <Modal
      title={`Transactions for ${
        selectedCategory ? categoryMap.get(selectedCategory)?.name || 'Unknown' : ''
      }`}
      open={isVisible}
      onCancel={handleClose}
      footer={null}
      width={1000}
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
          onChange: (page, pageSize) => {
            setPagination({
              current: page,
              pageSize: pageSize || 20,
            });
          },
        }}
        rowKey="key"
        scroll={{ x: 800 }}
      />
    </Modal>
  );
} 