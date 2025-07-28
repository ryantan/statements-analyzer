import { useState } from 'react';

export function useRemarksEditor() {
  const [editingRemarks, setEditingRemarks] = useState<string | null>(null);
  const [tempRemarks, setTempRemarks] = useState<string>('');

  const startEditing = (transactionKey: string, currentRemarks: string) => {
    setEditingRemarks(transactionKey);
    setTempRemarks(currentRemarks || '');
  };

  const cancelEditing = () => {
    setEditingRemarks(null);
    setTempRemarks('');
  };

  const isEditing = (transactionKey: string) => editingRemarks === transactionKey;

  return {
    editingRemarks,
    tempRemarks,
    setTempRemarks,
    startEditing,
    cancelEditing,
    isEditing,
  };
}