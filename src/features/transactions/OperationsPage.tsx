'use client';

import { useTransactions } from '@/features/transactions/TransactionsContext';
import { assignCommonCategories } from '@/features/transactions/assignCommonCategories';

import {
  CalendarOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ReloadOutlined,
  SaveOutlined,
  TagOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Typography,
  message,
} from 'antd';

const { Title, Paragraph } = Typography;

export function OperationsPage() {
  const {
    transactions,
    setTransactions,
    loadTransactions,
    isLoadingTransactions,
    loadFromFile,
  } = useTransactions();

  const handleClearCategories = () => {
    const newTransactions = transactions.map((transaction) => ({
      ...transaction,
      autoCategoryKey: undefined,
    }));
    setTransactions(newTransactions);
    message.success('Auto-assigned categories removed from all transactions.');
  };

  const handleAssignCategories = () => {
    const newTransactions = assignCommonCategories(transactions);
    setTransactions(newTransactions);
  };

  const handleDownloadJSON = () => {
    if (transactions.length === 0) {
      message.error('No transactions to download!');
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

    message.success('Transactions downloaded successfully!');
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        loadFromFile(content, false);
      } catch (error) {
        message.error(
          'Failed to parse JSON file. Please check the file format.'
        );
        console.error('Import error:', error);
      }
    };

    reader.onerror = () => {
      message.error('Failed to read the file.');
    };

    reader.readAsText(file);

    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleInsertJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        loadFromFile(content, true);
      } catch (error) {
        message.error(
          'Failed to parse JSON file. Please check the file format.'
        );
        console.error('Import error:', error);
      }
    };

    reader.onerror = () => {
      message.error('Failed to read the file.');
    };

    reader.readAsText(file);

    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleOverwriteLocalStorage = () => {
    setTransactions(transactions);
  };

  const handleSetDecemberTo2024 = () => {
    const newTransactions = transactions.map((transaction) => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate.getMonth() === 11) {
        // December is month 11 (0-indexed)
        const newDate = new Date(transactionDate);
        newDate.setFullYear(2024);
        return {
          ...transaction,
          date: newDate,
          dateFormatted: newDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
        };
      }
      return transaction;
    });

    const decemberTransactions = newTransactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === 11;
    });

    setTransactions(newTransactions);
    message.success(
      `Updated ${decemberTransactions.length} December transactions to year 2024.`
    );
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Transaction Operations</Title>
        <Paragraph style={{ color: '#666' }}>
          Manage your transaction data with import, export, and processing
          operations
        </Paragraph>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={transactions.length}
              prefix={<ReloadOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Auto-categorized"
              value={transactions.filter((t) => t.autoCategoryKey).length}
              prefix={<TagOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Manual Categories"
              value={transactions.filter((t) => t.categoryKey).length}
              prefix={<TagOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="With Accounting Date"
              value={transactions.filter((t) => t.accountingDate).length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Data Operations */}
      <Card title="Data Operations" style={{ marginBottom: '24px' }}>
        <Space wrap>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadTransactions}
            loading={isLoadingTransactions}
            size="large"
          >
            Refresh from Storage
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadJSON}
            disabled={transactions.length === 0}
            size="large"
          >
            Export JSON
          </Button>
          <Button
            icon={<UploadOutlined />}
            onClick={() =>
              document.getElementById('import-json-input')?.click()
            }
            size="large"
          >
            Import JSON (Replace)
          </Button>
          <input
            id="import-json-input"
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportJSON}
          />
          <Button
            icon={<UploadOutlined />}
            onClick={() =>
              document.getElementById('insert-json-input')?.click()
            }
            size="large"
          >
            Insert JSON (Merge)
          </Button>
          <input
            id="insert-json-input"
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleInsertJSON}
          />
          <Popconfirm
            title="Confirm overwrite"
            description="Are you sure to replace contents in localStorage?"
            onConfirm={handleOverwriteLocalStorage}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<SaveOutlined />} size="large">
              Overwrite localStorage
            </Button>
          </Popconfirm>
        </Space>
      </Card>

      {/* Category Operations */}
      <Card title="Category Operations" style={{ marginBottom: '24px' }}>
        <Space wrap>
          <Button
            icon={<TagOutlined />}
            onClick={handleAssignCategories}
            disabled={transactions.length === 0}
            size="large"
          >
            Auto-assign Categories
          </Button>
          <Popconfirm
            title="Clear all auto-assigned categories"
            description="Are you sure you want to delete all auto-assigned categories from transactions? This action cannot be undone."
            onConfirm={handleClearCategories}
            okText="Yes"
            cancelText="No"
            disabled={transactions.length === 0}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              disabled={transactions.length === 0}
              size="large"
            >
              Clear Auto-assigned Categories
            </Button>
          </Popconfirm>
        </Space>
      </Card>

      {/* Date Operations */}
      <Card title="Date Operations">
        <Space wrap>
          <Popconfirm
            title="Set December transactions to 2024"
            description="This will update all transactions with December dates to year 2024. Continue?"
            onConfirm={handleSetDecemberTo2024}
            okText="Yes"
            cancelText="No"
            disabled={transactions.length === 0}
          >
            <Button
              icon={<CalendarOutlined />}
              disabled={transactions.length === 0}
              size="large"
            >
              Set December 2024
            </Button>
          </Popconfirm>
        </Space>
      </Card>
    </div>
  );
}
