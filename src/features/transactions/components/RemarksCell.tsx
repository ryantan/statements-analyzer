'use client';

import { Button, Input } from 'antd';
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';

interface RemarksEditor {
  editingRemarks: string | null;
  tempRemarks: string;
  setTempRemarks: (value: string) => void;
  startEditing: (transactionKey: string, currentRemarks: string) => void;
  cancelEditing: () => void;
  isEditing: (transactionKey: string) => boolean;
}

interface RemarksCellProps {
  remarks?: string;
  transactionKey: string;
  remarksEditor: RemarksEditor;
  onSave: (transactionKey: string) => void;
}

export function RemarksCell({
  remarks,
  transactionKey,
  remarksEditor,
  onSave,
}: RemarksCellProps) {
  const isEditing = remarksEditor.isEditing(transactionKey);
  if (isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Input
          value={remarksEditor.tempRemarks}
          onChange={(e) => remarksEditor.setTempRemarks(e.target.value)}
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
          onClick={remarksEditor.cancelEditing}
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
        onClick={() => remarksEditor.startEditing(transactionKey, remarks || '')}
        style={{ opacity: 0.7 }}
      />
    </div>
  );
}