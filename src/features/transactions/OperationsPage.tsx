'use client';

import { assignCommonCategories } from '@/features/transactions/assignCommonCategories';
import { useStore } from '@/store/Store';

import { ChangeEvent } from 'react';

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
import { format } from 'date-fns';

const { Title, Paragraph } = Typography;

export function OperationsPage() {
  const {
    parsedTransactions,
    setParsedTransactions,
    loadTransactions,
    isLoadingTransactions,
    loadFromFile,
  } = useStore();

  const handleClearCategories = () => {
    const newTransactions = parsedTransactions.map((transaction) => ({
      ...transaction,
      autoCategoryKey: undefined,
    }));
    setParsedTransactions(newTransactions);
    void message.success(
      'Auto-assigned categories removed from all transactions.'
    );
  };

  const handleAssignCategories = () => {
    const newTransactions = assignCommonCategories(parsedTransactions);
    setParsedTransactions(newTransactions);
  };

  const handleDownloadJSON = () => {
    if (parsedTransactions.length === 0) {
      void message.error('No transactions to download!');
      return;
    }

    const dataStr = JSON.stringify(parsedTransactions, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'transactions.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    void message.success('Transactions downloaded successfully!');
  };

  const handleImportJSON = (event: ChangeEvent<HTMLInputElement>) => {
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
        void message.error(
          'Failed to parse JSON file. Please check the file format.'
        );
        console.error('Import error:', error);
      }
    };

    reader.onerror = () => {
      void message.error('Failed to read the file.');
    };

    reader.readAsText(file);

    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleInsertJSON = (event: ChangeEvent<HTMLInputElement>) => {
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
        void message.error(
          'Failed to parse JSON file. Please check the file format.'
        );
        console.error('Import error:', error);
      }
    };

    reader.onerror = () => {
      void message.error('Failed to read the file.');
    };

    reader.readAsText(file);

    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleOverwriteLocalStorage = () => {
    setParsedTransactions(parsedTransactions);
  };

  const handleSetDecemberTo2024 = () => {
    let updatedCount = 0;
    const newTransactions = parsedTransactions.map((transaction) => {
      if (transaction.date.getMonth() === 11) {
        // December is month 11 (0-indexed)
        const newDate = new Date(transaction.date);
        newDate.setFullYear(2024);
        updatedCount++;
        return {
          ...transaction,
          date: newDate,
          // "1 Jan"
          dateFormatted: format(newDate, 'd MMM'),
        };
      }
      return transaction;
    });

    setParsedTransactions(newTransactions);
    void message.success(
      `Updated ${updatedCount} December transactions to year 2024.`
    );
  };

  const handleExportManualTransactions = () => {
    const manualTransactions = parsedTransactions.filter(
      (t) => t.isManual === true
    );

    if (manualTransactions.length === 0) {
      void message.warning('No manual transactions found to export!');
      return;
    }

    const dataStr = JSON.stringify(manualTransactions, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
    const exportFileDefaultName = `manual-transactions-${timestamp}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    void message.success(
      `Exported ${manualTransactions.length} manual transactions successfully!`
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
              value={parsedTransactions.length}
              prefix={<ReloadOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Auto-categorized"
              value={parsedTransactions.filter((t) => t.autoCategoryKey).length}
              prefix={<TagOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Manual Categories"
              value={parsedTransactions.filter((t) => t.categoryKey).length}
              prefix={<TagOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="With Accounting Date"
              value={parsedTransactions.filter((t) => t.accountingDate).length}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Manual Transactions"
              value={
                parsedTransactions.filter((t) => t.isManual === true).length
              }
              prefix={<SaveOutlined />}
              valueStyle={{ color: '#722ed1' }}
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
            disabled={parsedTransactions.length === 0}
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
          >
            <Button icon={<DeleteOutlined />} danger size="large">
              Clear Auto-assigned Categories
            </Button>
          </Popconfirm>
        </Space>
      </Card>

      {/* Manual Transaction Operations */}
      <Card
        title="Manual Transaction Operations"
        style={{ marginBottom: '24px' }}
      >
        <Space wrap>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportManualTransactions}
            disabled={
              parsedTransactions.filter((t) => t.isManual === true).length === 0
            }
            size="large"
          >
            Export Manual Transactions
          </Button>
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
          >
            <Button icon={<CalendarOutlined />} size="large">
              Set December 2024
            </Button>
          </Popconfirm>
        </Space>
      </Card>
    </div>
  );
}
