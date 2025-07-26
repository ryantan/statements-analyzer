'use client';

import { Transaction } from '@/features/transactions/types';
import { extractTransactionsFromPdf } from '@/features/upload/extractTransactionsFromPdf';

import { useState } from 'react';

import {
  DownloadOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import {
  Button,
  Card,
  Popconfirm,
  Table,
  Typography,
  Upload,
  message,
} from 'antd';
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

const { Title } = Typography;

export function UploadPage() {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isPDF = file.type === 'application/pdf';
      if (!isPDF) {
        message.error('You can only upload PDF files!').then();
      }
      return isPDF || Upload.LIST_IGNORE;
    },
    fileList,
    onChange: ({ fileList }) => setFileList(fileList),
    multiple: true,
  };

  const handleParsePDF = async () => {
    if (fileList.length === 0) {
      message.error('Please upload a PDF file first!');
      return;
    }

    setLoading(true);

    const transactions: Transaction[] = [];

    for (const fileListItem of fileList) {
      const file = fileListItem.originFileObj;
      if (!file) {
        message.error('File not found!');
        return;
      }
      console.log(`Parsing ${file.name}`);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const transactionsOnThisPage =
          await extractTransactionsFromPdf(arrayBuffer);
        transactions.push(...transactionsOnThisPage);
      } catch (error) {
        console.error('Error parsing PDF:', error);
        message.error('Failed to parse PDF. Please try again.');
      }
    }
    setTransactions(transactions);

    setLoading(false);
  };

  const handleOverwriteLocalStorage = () => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  };

  const handleDownloadJSON = () => {
    if (transactions.length === 0) {
      message.error('No transactions to download!').then();
      return;
    }

    const dataStr = JSON.stringify(transactions, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'transactions.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    message.success('Transactions downloaded successfully!').then();
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'dateFormatted',
      key: 'date',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string[]) => (
        <div>
          {description.map((item, index) => (
            <p key={index}>{item}</p>
          ))}
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span style={{ color: amount >= 0 ? 'green' : 'red' }}>
          ${amount.toFixed(2)}
        </span>
      ),
    },
  ];

  const hasParsedTransactions = transactions.length > 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ padding: '24px' }}>
        <Title level={2}>Bank Statement Upload</Title>

        <Card style={{ marginBottom: '24px' }}>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Select PDF File</Button>
          </Upload>

          <Button
            type="primary"
            onClick={handleParsePDF}
            loading={loading}
            style={{ marginTop: '16px' }}
            disabled={fileList.length === 0}
          >
            Parse Transactions
          </Button>
          {hasParsedTransactions && (
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadJSON}
              style={{ marginTop: '16px', marginLeft: '8px' }}
              disabled={transactions.length === 0}
            >
              Download JSON
            </Button>
          )}
          {hasParsedTransactions && (
            <Popconfirm
              title="Confirm overwrite"
              description="Are you sure to replace contents in localStorage?"
              onConfirm={handleOverwriteLocalStorage}
              // onCancel={cancel}
              okText="Yes"
              cancelText="No"
            >
              <Button
                icon={<SaveOutlined />}
                style={{ marginTop: '16px', marginLeft: '8px' }}
              >
                Overwrite localStorage
              </Button>
            </Popconfirm>
          )}
        </Card>

        {hasParsedTransactions && (
          <Card>
            <Title level={3}>Transactions ({transactions.length})</Title>
            <Table
              columns={columns}
              dataSource={transactions}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 800 }}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
