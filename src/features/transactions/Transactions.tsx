'use client';

import { useCategories } from '@/features/category/useCategories';
import { CategoryCell } from '@/features/transactions/CategoryCell';
import { assignCommonCategories } from '@/features/transactions/assignCommonCategories';
import { RemarksCell } from '@/features/transactions/components/RemarksCell';
import {
  Transaction,
  TransactionDisplayItem,
} from '@/features/transactions/types';

import { useEffect, useMemo, useState } from 'react';

import {
  DeleteOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  SaveOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Switch,
  Table,
  Typography,
  message,
} from 'antd';

const { Title, Paragraph } = Typography;
const { Search } = Input;

export function TransactionsPage() {
  const { categories } = useCategories();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showOnlyUncategorized, setShowOnlyUncategorized] = useState(false);

  // Load transactions from localStorage on component mount
  useEffect(() => {
    loadTransactionsFromStorage();
  }, []);

  // Filter transactions when search text or uncategorized filter changes
  const processedTransactions = useMemo(() => {
    return transactions
      .filter(
        (transaction) =>
          !transaction.description
            .join(' ')
            .toUpperCase()
            .includes('FAST INCOMING PAYMENT')
      )
      .map<TransactionDisplayItem>((transaction) => ({
        ...transaction,
        resolvedCategoryKey:
          transaction.categoryKey || transaction.autoCategoryKey,
        searchText: [
          transaction.description.join(' '),
          transaction.dateFormatted,
          transaction.amount,
          transaction.remarks || '',
        ]
          .join('|')
          .toUpperCase(),
      }));
  }, [transactions]);

  // Filter transactions when search text or uncategorized filter changes
  const filteredTransactions = useMemo(() => {
    let filtered = [...processedTransactions];

    // Apply search filter
    const searchTextProcessed = searchText?.trim()?.toUpperCase() || '';
    if (searchTextProcessed) {
      filtered = filtered.filter((transaction) =>
        transaction.searchText.includes(searchTextProcessed)
      );
    }

    // Apply uncategorized filter
    if (showOnlyUncategorized) {
      filtered = filtered.filter(
        (transaction) => !transaction.resolvedCategoryKey
      );
    }

    return filtered;
  }, [processedTransactions, searchText, showOnlyUncategorized]);

  const saveTransactionsToLocalStorage = (items: Transaction[]) => {
    try {
      localStorage.setItem('transactions', JSON.stringify(items));
      message.success('Saved transactions to localStorage');
    } catch (error) {
      console.error('Error saving transactions to localStorage:', error);
      message.error('Failed to save transactions to localStorage');
    }
  };

  const loadTransactionsFromStorage = () => {
    setLoading(true);
    try {
      const storedTransactions = localStorage.getItem('transactions');
      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions);
        setTransactions(parsedTransactions);
        message.success(
          `Loaded ${parsedTransactions.length} transactions from storage`
        );
      } else {
        setTransactions([]);
        message.info('No transactions found in localStorage');
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      message.error('Failed to load transactions from localStorage');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCategories = () => {
    const newTransactions = transactions.map((transaction) => ({
      ...transaction,
      autoCategoryKey: undefined,
    }));
    saveTransactionsToLocalStorage(newTransactions);
    setTransactions(newTransactions);
    message.success('Auto-assigned categories removed from all transactions.');
  };

  // Auto-assigns categories.
  const handleAssignCategories = () => {
    const newTransactions = assignCommonCategories(transactions);
    saveTransactionsToLocalStorage(newTransactions);
    setTransactions(newTransactions);
  };

  const handleCategoryChange = (
    transactionKey: string,
    categoryKey: string | undefined
  ) => {
    const updatedTransactions = transactions.map((transaction) =>
      transaction.key === transactionKey
        ? { ...transaction, categoryKey }
        : transaction
    );
    saveTransactionsToLocalStorage(updatedTransactions);
    setTransactions(updatedTransactions);
  };

  const handleRemarksChange = (
    transactionKey: string,
    remarks: string | undefined
  ) => {
    const updatedTransactions = transactions.map((transaction) =>
      transaction.key === transactionKey
        ? { ...transaction, remarks }
        : transaction
    );
    saveTransactionsToLocalStorage(updatedTransactions);
    setTransactions(updatedTransactions);
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

  const handleOverwriteLocalStorage = () => {
    saveTransactionsToLocalStorage(transactions);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'dateFormatted',
      key: 'date',
      width: 100,
      sorter: (a: Transaction, b: Transaction) =>
        a.date.getTime() - b.date.getTime(),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string[]) => (
        <div>
          {description.map((item, index) => (
            <p key={index} style={{ margin: 0, lineHeight: '1.4' }}>
              {item}
            </p>
          ))}
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'categoryKey',
      width: 150,
      render: (categoryKey: string | null, record: TransactionDisplayItem) => (
        <CategoryCell
          transaction={record}
          categories={categories}
          onCategoryChange={handleCategoryChange}
        />
      ),
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 250,
      render: (remarks: string | undefined, record: TransactionDisplayItem) => (
        <RemarksCell
          remarks={remarks}
          transactionKey={record.key}
          onRemarksChange={handleRemarksChange}
        />
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right' as const,
      sorter: (a: Transaction, b: Transaction) => a.amount - b.amount,
      render: (amount: number) => (
        <span
          style={{
            color: amount >= 0 ? 'green' : 'red',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          ${amount.toFixed(2)}
        </span>
      ),
    },
  ];

  const totalAmount = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );
  const positiveAmount = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const negativeAmount = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Transaction History</Title>
        <Paragraph style={{ color: '#666' }}>
          View and manage your stored transactions from localStorage
        </Paragraph>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={processedTransactions.length}
              prefix={<SearchOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Net expense"
              value={-1 * totalAmount}
              precision={2}
              prefix="$"
              valueStyle={{ color: totalAmount >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="To be categorized"
              value={
                processedTransactions.filter((t) => !t.resolvedCategoryKey)
                  .length
              }
              precision={0}
              prefix=""
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div
          style={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Search
              placeholder="Search transactions by description, date, or amount..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 400, minWidth: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilterOutlined />
              <span>Show only uncategorized:</span>
              <Switch
                checked={showOnlyUncategorized}
                onChange={setShowOnlyUncategorized}
                size="small"
              />
            </div>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadTransactionsFromStorage}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadJSON}
              disabled={transactions.length === 0}
            >
              Export JSON
            </Button>
            <Popconfirm
              title="Confirm overwrite"
              description="Are you sure to replace contents in localStorage?"
              onConfirm={handleOverwriteLocalStorage}
              okText="Yes"
              cancelText="No"
            >
              <Button icon={<SaveOutlined />}>Overwrite localStorage</Button>
            </Popconfirm>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleAssignCategories}
              disabled={transactions.length === 0}
            >
              Assign categories
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
              >
                Clear assigned categories
              </Button>
            </Popconfirm>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredTransactions}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} transactions`,
          }}
          scroll={{ x: 1000 }}
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                description={
                  <span>
                    No transactions found.{' '}
                    <Button type="link" onClick={loadTransactionsFromStorage}>
                      Refresh
                    </Button>{' '}
                    or upload some transactions first.
                  </span>
                }
              />
            ),
          }}
          rowKey="key"
        />
      </Card>
    </div>
  );
}
