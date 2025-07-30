import { Category } from '@/features/categories/types';

import { useState } from 'react';

import { Descriptions, Modal } from 'antd';
import { format } from 'date-fns';

import { TransactionDisplayItem } from '../types';

interface UseTransactionDetailsModalProps {
  categories: Category[];
}

export const useTransactionDetailsModal = ({
  categories,
}: UseTransactionDetailsModalProps) => {
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionDisplayItem | null>(null);

  const handleViewDetails = (transaction: TransactionDisplayItem) => {
    setSelectedTransaction(transaction);
    setDetailsModalVisible(true);
  };

  const handleCloseDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedTransaction(null);
  };

  const TransactionDetailsModal = () => (
    <Modal
      title="Transaction Details"
      open={detailsModalVisible}
      onCancel={handleCloseDetailsModal}
      footer={null}
      width={600}
    >
      {selectedTransaction && (
        <Descriptions
          bordered
          column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 2, xs: 2 }}
          layout="vertical"
        >
          <Descriptions.Item label="Date" span={1}>
            {selectedTransaction.date
              ? format(selectedTransaction.date, 'dd MMM yyyy')
              : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Accounting Period" span={1}>
            {selectedTransaction.accountingDate
              ? format(selectedTransaction.accountingDate, 'dd MMM yyyy')
              : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {selectedTransaction.description.join(', ')}
          </Descriptions.Item>
          <Descriptions.Item label="Bank">
            {selectedTransaction.bank}
          </Descriptions.Item>
          <Descriptions.Item label="Account">
            {selectedTransaction.bankAccount}
          </Descriptions.Item>
          <Descriptions.Item label="Category">
            {selectedTransaction.resolvedCategoryKey
              ? categories.find(
                  (c) => c.key === selectedTransaction.resolvedCategoryKey
                )?.name
              : 'Unassigned'}
          </Descriptions.Item>
          <Descriptions.Item label="Remarks">
            {selectedTransaction.remarks}
          </Descriptions.Item>
          <Descriptions.Item label="Claimable">
            {selectedTransaction.claimable ? 'Yes' : 'No'}
          </Descriptions.Item>
          <Descriptions.Item label="Amount">
            ${selectedTransaction.amount.toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="Raw Data">
            <pre
              style={{
                backgroundColor: '#f5f5f5',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '200px',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
              }}
            >
              {JSON.stringify(selectedTransaction, null, 2)}
            </pre>
          </Descriptions.Item>
        </Descriptions>
      )}
    </Modal>
  );

  return {
    handleViewDetails,
    TransactionDetailsModal,
  };
};
