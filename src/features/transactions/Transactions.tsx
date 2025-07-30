'use client';

import { DatePicker } from '@/components';
import { useCategories } from '@/features/categories/useCategories';
import { useTransactions } from '@/features/transactions/TransactionsContext';
import { assignCommonCategories } from '@/features/transactions/assignCommonCategories';
import { AccountingDateCell } from '@/features/transactions/components/AccountingDateCell';
import { CategoryCell } from '@/features/transactions/components/CategoryCell';
import { RemarksCell } from '@/features/transactions/components/RemarksCell';
import { TransactionDisplayItem } from '@/features/transactions/types';
import { isNotCCPayments } from '@/features/transactions/utils/isNotCCPayments';
import {
  isClaimable,
  isNotClaimable,
} from '@/features/transactions/utils/isNotClaimable';
import { useAvailableHeight } from '@/utils/hooks/useAvailableHeight';

import { useMemo, useState } from 'react';

import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  SaveOutlined,
  SearchOutlined,
  TagOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import { endOfDay, isAfter, isBefore, startOfDay } from 'date-fns';

import { useTransactionDetailsModal } from './hooks/useTransactionDetailsModal';

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

export function TransactionsPage() {
  const { categories } = useCategories();
  const {
    transactions,
    setTransactions,
    loadTransactions,
    isLoadingTransactions,
    loadFromFile,
  } = useTransactions();
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null] | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [claimableFilter, setClaimableFilter] =
    useState<string>('not-claimable');
  const [accountingPeriodFilter, setAccountingPeriodFilter] =
    useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });
  const { containerRef, availableHeight } = useAvailableHeight({
    additionalOffset: 124,
  });

  const { handleViewDetails, TransactionDetailsModal } =
    useTransactionDetailsModal({ categories });

  // Filter transactions when search text or uncategorized filter changes
  const processedTransactions = useMemo(() => {
    return transactions
      .filter(isNotCCPayments)
      .map<TransactionDisplayItem>((transaction) => ({
        ...transaction,
        resolvedCategoryKey:
          transaction.categoryKey || transaction.autoCategoryKey,
        searchText: [
          transaction.description.join(' '),
          transaction.dateFormatted,
          transaction.amount,
          transaction.remarks || '',
          transaction.accountingDate
            ? new Date(transaction.accountingDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
              })
            : '',
        ]
          .join('|')
          .toUpperCase(),
      }));
  }, [transactions]);

  // Filter transactions when search text, uncategorized filter, date range, or category changes
  const filteredTransactions = useMemo(() => {
    let filtered = [...processedTransactions];

    // Apply search filter
    const searchTextProcessed = searchText?.trim()?.toUpperCase() || '';
    if (searchTextProcessed) {
      filtered = filtered.filter((transaction) =>
        transaction.searchText.includes(searchTextProcessed)
      );
    }

    // Apply date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = startOfDay(dateRange[0]);
      const endDate = endOfDay(dateRange[1]);
      filtered = filtered.filter((transaction) => {
        const transactionDate = transaction.date;
        return (
          isAfter(transactionDate, startDate) &&
          isBefore(transactionDate, endDate)
        );
      });
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== '') {
      if (selectedCategory === 'unassigned') {
        filtered = filtered.filter(
          (transaction) => !transaction.resolvedCategoryKey
        );
      } else {
        filtered = filtered.filter(
          (transaction) => transaction.resolvedCategoryKey === selectedCategory
        );
      }
    }

    // Apply claimable filter
    if (claimableFilter && claimableFilter !== '') {
      if (claimableFilter === 'claimable') {
        filtered = filtered.filter(isClaimable);
      } else if (claimableFilter === 'not-claimable') {
        filtered = filtered.filter(isNotClaimable);
      }
    }

    // Apply accounting period filter
    if (accountingPeriodFilter && accountingPeriodFilter !== '') {
      if (accountingPeriodFilter === 'assigned') {
        filtered = filtered.filter((transaction) => transaction.accountingDate);
      } else if (accountingPeriodFilter === 'unassigned') {
        filtered = filtered.filter(
          (transaction) => !transaction.accountingDate
        );
      }
    }

    return filtered;
  }, [
    processedTransactions,
    searchText,
    dateRange,
    selectedCategory,
    claimableFilter,
    accountingPeriodFilter,
  ]);

  const handleClearCategories = () => {
    const newTransactions = transactions.map((transaction) => ({
      ...transaction,
      autoCategoryKey: undefined,
    }));
    setTransactions(newTransactions);
    message.success('Auto-assigned categories removed from all transactions.');
  };

  // Auto-assigns categories.
  const handleAssignCategories = () => {
    const newTransactions = assignCommonCategories(transactions);
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
    setTransactions(updatedTransactions);
  };

  const handleClaimableChange = (
    transactionKey: string,
    claimable: boolean
  ) => {
    const updatedTransactions = transactions.map((transaction) =>
      transaction.key === transactionKey
        ? { ...transaction, claimable }
        : transaction
    );
    setTransactions(updatedTransactions);
  };

  const handleAccountingDateChange = (
    transactionKey: string,
    accountingDate: Date | undefined
  ) => {
    const updatedTransactions = transactions.map((transaction) =>
      transaction.key === transactionKey
        ? {
            ...transaction,
            accountingDate,
            accountingYear: accountingDate
              ? accountingDate.getFullYear()
              : undefined,
            accountingMonth: accountingDate
              ? accountingDate.getMonth() + 1
              : undefined,
            accountingDay: accountingDate
              ? accountingDate.getDate()
              : undefined,
          }
        : transaction
    );
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

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        loadFromFile(content);
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

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const columns: ColumnsType<TransactionDisplayItem> = [
    {
      title: 'Date',
      dataIndex: 'dateFormatted',
      key: 'date',
      width: 100,
      defaultSortOrder: 'descend',
      sortDirections: ['descend', 'ascend'],
      sorter: (a: TransactionDisplayItem, b: TransactionDisplayItem) =>
        a.date.getTime() - b.date.getTime(),
    },
    {
      title: 'Accounting Period',
      dataIndex: 'accountingDate',
      key: 'accountingDate',
      width: 140,
      align: 'center' as const,
      render: (
        accountingDate: Date | undefined,
        record: TransactionDisplayItem
      ) => (
        <AccountingDateCell
          transaction={record}
          onAccountingDateChange={handleAccountingDateChange}
        />
      ),
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
      title: 'Bank',
      dataIndex: 'bank',
      key: 'bank',
      width: 120,
      render: (bank: string | undefined) => (
        <span style={{ fontSize: '12px', color: '#666' }}>{bank || '-'}</span>
      ),
    },
    {
      title: 'Account',
      dataIndex: 'bankAccount',
      key: 'bankAccount',
      width: 120,
      render: (bankAccount: string | undefined) => (
        <span style={{ fontSize: '12px', color: '#666' }}>
          {bankAccount || '-'}
        </span>
      ),
    },
    // {
    //   title: 'File',
    //   dataIndex: 'fileName',
    //   key: 'fileName',
    //   width: 150,
    //   render: (fileName: string | undefined) => (
    //     <span style={{ fontSize: '12px', color: '#666' }}>
    //       {fileName || '-'}
    //     </span>
    //   ),
    // },
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
      title: 'Claimable',
      dataIndex: 'claimable',
      key: 'claimable',
      width: 100,
      align: 'center' as const,
      render: (
        claimable: boolean | undefined,
        record: TransactionDisplayItem
      ) => (
        <Tooltip
          title={claimable ? 'Mark as not claimable' : 'Mark as claimable'}
        >
          <Button
            type="text"
            icon={
              claimable ? (
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              ) : (
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
              )
            }
            onClick={() => handleClaimableChange(record.key, !claimable)}
            style={{ padding: '4px' }}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right' as const,
      fixed: 'right',
      sorter: (a, b) => a.amount - b.amount,
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
    {
      title: 'View Details',
      key: 'viewDetails',
      width: 100,
      align: 'center' as const,
      render: (_, record: TransactionDisplayItem) => (
        <Tooltip title="View transaction details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            style={{ padding: '4px' }}
          />
        </Tooltip>
      ),
    },
  ];

  const totalAmount = processedTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Transaction History</Title>
        <Paragraph style={{ color: '#666' }}>
          View and manage your stored transactions from localStorage
        </Paragraph>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadTransactions}
            loading={isLoadingTransactions}
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
          <Button
            icon={<UploadOutlined />}
            onClick={() =>
              document.getElementById('import-json-input')?.click()
            }
          >
            Import JSON
          </Button>
          <input
            id="import-json-input"
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportJSON}
          />
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
            >
              Set December 2024
            </Button>
          </Popconfirm>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={processedTransactions.length}
              prefix={<SearchOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Net expense"
              value={totalAmount}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
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
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Claimable transactions"
              value={
                processedTransactions.filter((t) => t.claimable === true).length
              }
              precision={0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={4}>
          <Card>
            <Statistic
              title="Without accounting period"
              value={
                processedTransactions.filter((t) => !t.accountingDate).length
              }
              precision={0}
              prefix={<CalendarOutlined />}
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              flex: 1,
            }}
          >
            <Search
              placeholder="Search transactions by description, date, or amount..."
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%', maxWidth: 400, minWidth: 250 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarOutlined />
              <span>Date range:</span>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder={['Start date', 'End date']}
                style={{ width: '100%', maxWidth: 240, minWidth: 200 }}
                allowClear
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TagOutlined />
              <span>Category:</span>
              <Select
                placeholder="Select category"
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: '100%', maxWidth: 200, minWidth: 150 }}
                allowClear
                options={[
                  { value: '', label: 'All categories' },
                  { value: 'unassigned', label: 'Unassigned' },
                  ...categories.map((category) => ({
                    value: category.key,
                    label: (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: category.color,
                          }}
                        />
                        {category.name}
                      </div>
                    ),
                  })),
                ]}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircleOutlined />
              <span>Claimable:</span>
              <Select
                placeholder="Filter by claimable status"
                value={claimableFilter}
                onChange={setClaimableFilter}
                style={{ width: '100%', maxWidth: 180, minWidth: 140 }}
                allowClear
                options={[
                  { value: '', label: 'All transactions' },
                  { value: 'claimable', label: 'Claimable' },
                  { value: 'not-claimable', label: 'Not claimable' },
                ]}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarOutlined />
              <span style={{ whiteSpace: 'nowrap' }}>
                Custom accounting date
              </span>
              <Select
                placeholder="Filter by custom accounting period"
                value={accountingPeriodFilter}
                onChange={setAccountingPeriodFilter}
                style={{ width: '100%', maxWidth: 180, minWidth: 140 }}
                allowClear
                options={[
                  { value: '', label: 'All' },
                  { value: 'assigned', label: 'Has assigned period' },
                  { value: 'unassigned', label: 'No assigned period' },
                ]}
              />
            </div>
          </div>
        </div>

        <div ref={containerRef}>
          <Table<TransactionDisplayItem>
            columns={columns}
            dataSource={filteredTransactions}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} transactions`,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: (page, pageSize) => {
                setPagination({
                  current: page,
                  pageSize: pageSize || 20,
                });
              },
            }}
            scroll={{ x: 'max-content', y: availableHeight }}
            loading={isLoadingTransactions}
            locale={{
              emptyText: (
                <Empty
                  description={
                    <span>
                      No transactions found.{' '}
                      <Button type="link" onClick={loadTransactions}>
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
        </div>
      </Card>

      <TransactionDetailsModal />
    </div>
  );
}
