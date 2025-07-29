'use client';

import MyDatePicker from '@/components/DatePicker';
import { Transaction } from '@/features/transactions/types';

import { useState } from 'react';

import {
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Button, Tooltip, Typography } from 'antd';
import { format } from 'date-fns';

import styles from './AccountingDateCell.module.scss';

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
    return format(date, "dd MMM ''yy");
  };

  if (isEditing) {
    return (
      <div
        style={{
          width: 128,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <MyDatePicker
          value={tempDate}
          onChange={setTempDate}
          picker="date"
          format="dd MMM yyyy"
          size="small"
          style={{ width: '100%' }}
        />
        <div>
          <Button
            type="text"
            size="small"
            icon={<CheckOutlined />}
            onClick={handleSave}
            style={{ padding: '2px 16px' }}
          />
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={handleCancel}
            style={{ padding: '2px 16px' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.accountingDateCell}>
      {transaction.accountingDate ? (
        <Tooltip title="Click to edit accounting period">
          <Button
            type="text"
            size="small"
            onClick={() => setIsEditing(true)}
            style={{ padding: '2px', height: 'auto', flex: '1 0 auto' }}
          >
            <Text style={{ fontSize: '12px', width: '100%' }}>
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
            style={{ padding: '4px 0', width: '100%' }}
          />
        </Tooltip>
      )}
      {transaction.accountingDate && (
        <Tooltip title="Clear accounting period">
          <Button
            // type="text"
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleClear}
            className={styles.accountingDateCellDelete}
          />
        </Tooltip>
      )}
    </div>
  );
}
