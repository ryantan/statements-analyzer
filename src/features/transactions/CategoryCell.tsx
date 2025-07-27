'use client';

import { Category } from '@/features/category/types';
import { Transaction } from '@/features/transactions/types';

import { useState } from 'react';

import { EditOutlined } from '@ant-design/icons';
import { Button, Dropdown, Tag } from 'antd';

interface CategoryCellProps {
  transaction: Transaction;
  categories: Category[];
  onCategoryChange: (
    transactionKey: number,
    categoryKey: string | null
  ) => void;
}

export function CategoryCell({
  transaction,
  categories,
  onCategoryChange,
}: CategoryCellProps) {
  const [isHovered, setIsHovered] = useState(false);

  const currentCategory = transaction.categoryKey
    ? categories.find((c) => c.key === transaction.categoryKey)
    : null;

  const handleCategorySelect = (categoryKey: string) => {
    onCategoryChange(
      transaction.key,
      categoryKey === 'none' ? null : categoryKey
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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minHeight: '32px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {currentCategory ? (
        <Tag color={currentCategory.color}>{currentCategory.name}</Tag>
      ) : (
        <span style={{ color: '#999' }}>-</span>
      )}

      {isHovered && (
        <Dropdown
          menu={{
            items: dropdownItems,
            onClick: ({ key }) => handleCategorySelect(key),
          }}
          trigger={['click']}
          placement="bottomLeft"
        >
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            style={{
              padding: '2px 4px',
              height: '24px',
              opacity: 0.7,
            }}
          />
        </Dropdown>
      )}
    </div>
  );
}
