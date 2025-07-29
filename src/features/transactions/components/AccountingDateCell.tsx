'use client';

import MyDatePicker from '@/components/DatePicker';
import { Transaction } from '@/features/transactions/types';

import { useState } from 'react';

import {
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Button, Popconfirm, Tooltip, Typography } from 'antd';
import { format, parse } from 'date-fns';

const { Text } = Typography;

interface AccountingDateCellProps {
  transaction: Transaction;
  onAccountingDateChange: (
    transactionKey: string,
    accountingDate: Date | undefined
  ) => void;
}

export function AccountingDateCell({
  transaction,
  onAccountingDateChange,
}: AccountingDateCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(
    transaction.accountingDate ? new Date(transaction.accountingDate) : null
  );

  const handleSave = () => {
    onAccountingDateChange(transaction.key, tempDate || undefined);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempDate(
      transaction.accountingDate ? new Date(transaction.accountingDate) : null
    );
    setIsEditing(false);
  };

  const handleClear = () => {
    onAccountingDateChange(transaction.key, undefined);
  };

  const formatAccountingDate = (date: Date) => {
    return format(date, 'MMM yyyy');
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <MyDatePicker
          value={tempDate}
          onChange={setTempDate}
          picker="month"
          format="MMM yyyy"
          size="small"
          style={{ width: '100px' }}
        />
        <Button
          type="text"
          size="small"
          icon={<CheckOutlined />}
          onClick={handleSave}
          style={{ padding: '2px' }}
        />
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={handleCancel}
          style={{ padding: '2px' }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {transaction.accountingDate ? (
        <Tooltip title="Click to edit accounting period">
          <Button
            type="text"
            size="small"
            onClick={() => setIsEditing(true)}
            style={{ padding: '2px', height: 'auto' }}
          >
            <Text style={{ fontSize: '12px' }}>
              {formatAccountingDate(new Date(transaction.accountingDate))}
            </Text>
          </Button>
        </Tooltip>
      ) : (
        <Tooltip title="Set accounting period">
          <Button
            type="text"
            size="small"
            icon={<CalendarOutlined />}
            onClick={() => setIsEditing(true)}
            style={{ padding: '2px' }}
          />
        </Tooltip>
      )}
      {transaction.accountingDate && (
        <Tooltip title="Clear accounting period">
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={handleClear}
            style={{ padding: '2px' }}
          />
        </Tooltip>
      )}
    </div>
  );
}
