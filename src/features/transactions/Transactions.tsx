'use client';

import { Transaction } from '@/features/transactions/types';

import { useEffect, useState } from 'react';

import {
  DeleteOutlined,
  DownloadOutlined,
  ReloadOutlined,
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
  Table,
  Typography,
  message,
} from 'antd';

const { Title, Paragraph } = Typography;
const { Search } = Input;

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Load transactions from localStorage on component mount
  useEffect(() => {
    loadTransactionsFromStorage();
  }, []);

  // Filter transactions when search text changes
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter(
        (transaction) =>
          transaction.description.some((desc) =>
            desc.toLowerCase().includes(searchText.toLowerCase())
          ) ||
          transaction.dateFormatted
            .toLowerCase()
            .includes(searchText.toLowerCase()) ||
          transaction.amountFormatted.includes(searchText)
      );
      setFilteredTransactions(filtered);
    }
  }, [transactions, searchText]);

  const loadTransactionsFromStorage = () => {
    setLoading(true);
    try {
      const storedTransactions = localStorage.getItem('transactions');
      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions);
        setTransactions(parsedTransactions);
        setFilteredTransactions(parsedTransactions);
        message.success(
          `Loaded ${parsedTransactions.length} transactions from storage`
        );
      } else {
        setTransactions([]);
        setFilteredTransactions([]);
        message.info('No transactions found in localStorage');
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      message.error('Failed to load transactions from localStorage');
      setTransactions([]);
      setFilteredTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearStorage = () => {
    localStorage.removeItem('transactions');
    setTransactions([]);
    setFilteredTransactions([]);
    setSearchText('');
    message.success('All transactions cleared from localStorage');
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
              value={transactions.length}
              prefix={<SearchOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Net Balance"
              value={totalAmount}
              precision={2}
              prefix="$"
              valueStyle={{ color: totalAmount >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Income vs Expenses"
              value={positiveAmount + negativeAmount}
              precision={2}
              prefix="$"
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
          <Search
            placeholder="Search transactions by description, date, or amount..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 400, minWidth: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
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
              title="Clear all transactions"
              description="Are you sure you want to delete all transactions from localStorage? This action cannot be undone."
              onConfirm={handleClearStorage}
              okText="Yes"
              cancelText="No"
              disabled={transactions.length === 0}
            >
              <Button
                icon={<DeleteOutlined />}
                danger
                disabled={transactions.length === 0}
              >
                Clear All
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
          scroll={{ x: 800 }}
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
