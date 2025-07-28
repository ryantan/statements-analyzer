'use client';

import { Button, Input } from 'antd';
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';

interface RemarksCellProps {
  remarks?: string;
  transactionKey: string;
  isEditing: boolean;
  tempRemarks: string;
  onTempRemarksChange: (value: string) => void;
  onStartEdit: (transactionKey: string, currentRemarks: string) => void;
  onSave: (transactionKey: string) => void;
  onCancel: () => void;
}

export function RemarksCell({
  remarks,
  transactionKey,
  isEditing,
  tempRemarks,
  onTempRemarksChange,
  onStartEdit,
  onSave,
  onCancel,
}: RemarksCellProps) {
  if (isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Input
          value={tempRemarks}
          onChange={(e) => onTempRemarksChange(e.target.value)}
          placeholder="Add remarks..."
          size="small"
          onPressEnter={() => onSave(transactionKey)}
          autoFocus
        />
        <Button
          type="text"
          size="small"
          icon={<CheckOutlined />}
          onClick={() => onSave(transactionKey)}
          style={{ color: 'green' }}
        />
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={onCancel}
          style={{ color: 'red' }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ flex: 1, fontSize: '13px' }}>
        {remarks || <em style={{ color: '#999' }}>No remarks</em>}
      </span>
      <Button
        type="text"
        size="small"
        icon={<EditOutlined />}
        onClick={() => onStartEdit(transactionKey, remarks || '')}
        style={{ opacity: 0.7 }}
      />
    </div>
  );
}