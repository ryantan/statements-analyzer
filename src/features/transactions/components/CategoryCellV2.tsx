'use client';

import { Category } from '@/features/categories/types';
import { Transaction } from '@/features/transactions/types';

import { useState } from 'react';

import { EditOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps, Tag, message } from 'antd';

interface CategoryCellV2Props {
  transaction: Transaction;
  categories: Category[];
  onCategoryChange: (
    transactionKey: string,
    newCategoryKey: string | undefined
  ) => void;
}

/**
 * This is a version of the CategoryCell that was implemented by Cursor.
 *
 * @param transaction
 * @param categories
 * @param onCategoryChange
 * @constructor
 */
export function CategoryCellV2({
  transaction,
  categories,
  onCategoryChange,
}: CategoryCellV2Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentCategory = categories.find(
    (c) => c.key === transaction.categoryKey
  );

  const handleCategorySelect: MenuProps['onClick'] = ({ key }) => {
    const newCategoryKey = key === 'none' ? undefined : key;
    onCategoryChange(transaction.key, newCategoryKey);
    void message.success('Category updated successfully');
    setIsDropdownOpen(false);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'none',
      label: 'No Category',
    },
    ...categories.map((category) => ({
      key: category.key,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: category.color,
            }}
          />
          {category.name}
        </div>
      ),
    })),
  ];

  const shouldShowEditButton = isHovered || isDropdownOpen;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        position: 'relative',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!transaction.categoryKey ? (
        <span>-</span>
      ) : !currentCategory ? (
        <span>({transaction.categoryKey} not found)</span>
      ) : (
        <Tag color={currentCategory.color}>{currentCategory.name}</Tag>
      )}

      {shouldShowEditButton && (
        <Dropdown
          menu={{ items: menuItems, onClick: handleCategorySelect }}
          trigger={['click']}
          placement="bottomLeft"
          open={isDropdownOpen}
          onOpenChange={setIsDropdownOpen}
        >
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            style={{
              padding: '2px 4px',
              minWidth: 'auto',
              height: 'auto',
            }}
          />
        </Dropdown>
      )}
    </div>
  );
}
