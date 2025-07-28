import React, { useState } from 'react';

import { CloseOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Input, Space } from 'antd';

interface RemarksCellProps {
  remarks?: string;
  transactionKey: string;
  onRemarksChange: (
    transactionKey: string,
    remarks: string | undefined
  ) => void;
}

export function RemarksCell({
  remarks,
  transactionKey,
  onRemarksChange,
}: RemarksCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(remarks || '');

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    onRemarksChange(transactionKey, trimmedValue || undefined);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(remarks || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Space>
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onPressEnter={handleSave}
          autoFocus
          style={{ width: 200 }}
        />
        <Button
          type="text"
          size="small"
          icon={<SaveOutlined />}
          onClick={handleSave}
        />
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={handleCancel}
        />
      </Space>
    );
  }

  return (
    <Space>
      <span style={{ minWidth: 200, display: 'inline-block' }}>
        {remarks || '-'}
      </span>
      <Button
        type="text"
        size="small"
        icon={<EditOutlined />}
        onClick={() => setIsEditing(true)}
      />
    </Space>
  );
}
