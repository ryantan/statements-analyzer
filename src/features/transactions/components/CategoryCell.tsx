'use client';

import { Category } from '@/features/categories/types';
import { TransactionDisplayItem } from '@/features/transactions/types';

import { useState } from 'react';

import { Dropdown, Tag } from 'antd';

import styles from './CategoryCell.module.scss';

interface CategoryCellProps {
  transaction: TransactionDisplayItem;
  categories: Category[];
  onCategoryChange: (
    transactionKey: string,
    categoryKey: string | undefined
  ) => void;
}

export function CategoryCell({
  transaction,
  categories,
  onCategoryChange,
}: CategoryCellProps) {
  const currentCategory = transaction.resolvedCategoryKey
    ? categories.find((c) => c.key === transaction.resolvedCategoryKey)
    : null;

  const handleCategorySelect = (categoryKey: string) => {
    onCategoryChange(
      transaction.key,
      categoryKey === 'none' ? undefined : categoryKey
    );
  };

  const dropdownItems = [
    {
      key: 'none',
      label: <span style={{ color: '#999' }}>No category</span>,
    },
    ...categories.map((category) => ({
      key: category.key,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tag color={category.color} style={{ margin: 0 }}>
            {category.name}
          </Tag>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {category.description}
          </span>
        </div>
      ),
    })),
  ];

  return (
    <div className={styles.categoryCell}>
      <Dropdown
        menu={{
          items: dropdownItems,
          onClick: ({ key }) => handleCategorySelect(key),
          style: { maxHeight: 300 },
        }}
        trigger={['click']}
        placement="bottomLeft"
      >
        <div>
          {currentCategory ? (
            <Tag color={currentCategory.color}>{currentCategory.name}</Tag>
          ) : (
            <span style={{ color: '#999', width: '100%' }}>-</span>
          )}
        </div>
      </Dropdown>
    </div>
  );
}
