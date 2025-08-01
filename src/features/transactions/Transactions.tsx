'use client';

import { DatePicker } from '@/components';
import { useCategories } from '@/features/categories/useCategories';
import { AccountingDateCell } from '@/features/transactions/components/AccountingDateCell';
import { CategoryCell } from '@/features/transactions/components/CategoryCell';
import { ManualTransactionForm } from '@/features/transactions/components/ManualTransactionForm';
import { RemarksCell } from '@/features/transactions/components/RemarksCell';
import { TransactionDisplayItem } from '@/features/transactions/types';
import {
  isNotCCPayments,
  isNotRebates,
} from '@/features/transactions/utils/isNotCCPayments';
import {
  isClaimable,
  isNotClaimable,
} from '@/features/transactions/utils/isNotClaimable';
import { useStore } from '@/store/TransactionsContext';
import { useAvailableHeight } from '@/utils/hooks/useAvailableHeight';

import { useMemo, useState } from 'react';

import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  TagOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Select,
  Statistic,
  Switch,
  Table,
  Tooltip,
  Typography,
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
    loadTransactions,
    isLoadingTransactions,
    updateTransactionItem,
    addTransaction,
    resolvedTransactions,
  } = useStore();
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null] | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [claimableFilter, setClaimableFilter] =
    useState<string>('not-claimable');
  const [accountingPeriodFilter, setAccountingPeriodFilter] =
    useState<string>('');
  const [manualFilter, setManualFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });
  const { containerRef, availableHeight } = useAvailableHeight({
    additionalOffset: 124,
  });

  const { handleViewDetails, TransactionDetailsModal } =
    useTransactionDetailsModal({ categories });

  const [showExtraStats, setShowExtraStats] = useState(false);
  const [showManualTransactionForm, setShowManualTransactionForm] =
    useState(false);

  const onChangeShowExtraStats = (checked: boolean) => {
    setShowExtraStats(checked);
  };

  // Filter transactions when search text or uncategorized filter changes
  const processedTransactions = useMemo(() => {
    return resolvedTransactions
      .filter(isNotCCPayments)
      .filter(isNotRebates)
      .map<TransactionDisplayItem>((transaction) => ({
        ...transaction,
        searchText: [
          transaction.description.join(' '),
          transaction.dateFormatted,
          transaction.amount,
          transaction.remarks || '',
        ]
          .join('|')
          .toUpperCase(),
      }));
  }, [resolvedTransactions]);

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

    // Apply manual filter
    if (manualFilter && manualFilter !== '') {
      if (manualFilter === 'manual') {
        filtered = filtered.filter(
          (transaction) => transaction.isManual === true
        );
      } else if (manualFilter === 'imported') {
        filtered = filtered.filter((transaction) => !transaction.isManual);
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
    manualFilter,
  ]);

  const handleCategoryChange = (
    transactionKey: string,
    categoryKey: string | undefined
  ) => {
    updateTransactionItem(transactionKey, (transaction) => ({
      ...transaction,
      categoryKey,
    }));
  };

  const handleRemarksChange = (
    transactionKey: string,
    remarks: string | undefined
  ) => {
    updateTransactionItem(transactionKey, (transaction) => ({
      ...transaction,
      remarks,
    }));
  };

  const handleClaimableChange = (
    transactionKey: string,
    claimable: boolean
  ) => {
    updateTransactionItem(transactionKey, (transaction) => ({
      ...transaction,
      claimable,
    }));
  };

  const handleAccountingDateChange = (
    transactionKey: string,
    accountingDate: Date | undefined
  ) => {
    if (accountingDate) {
      updateTransactionItem(transactionKey, (transaction) => ({
        ...transaction,
        accountingDate,
        accountingYear: accountingDate.getFullYear(),
        accountingMonth: accountingDate.getMonth() + 1,
        accountingDay: accountingDate.getDate(),
      }));
    } else {
      updateTransactionItem(transactionKey, (transaction) => ({
        ...transaction,
        accountingDate: undefined,
      }));
      return;
    }
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
      title: '',
      dataIndex: 'isManual',
      key: 'isManual',
      width: 40,
      align: 'center' as const,
      render: (isManual: boolean | undefined) =>
        isManual ? (
          <Tooltip title="Manually added transaction">
            <EditOutlined style={{ color: '#722ed1' }} />
          </Tooltip>
        ) : null,
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
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={7} md={7}>
          <Title level={2}>Transaction History</Title>
          <Paragraph style={{ color: '#666' }}>
            View and manage your stored transactions from localStorage
          </Paragraph>
        </Col>
        <Col xs={24} sm={17} md={17}>
          {/* Statistics Cards */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card>
                <Statistic
                  title="Total Transactions"
                  value={processedTransactions.length}
                  prefix={<SearchOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
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
            <Col xs={24} sm={12} md={8}>
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
            {showExtraStats && (
              <Col xs={24} sm={12} md={8}>
                <Card>
                  <Statistic
                    title="Claimable transactions"
                    value={
                      processedTransactions.filter((t) => t.claimable === true)
                        .length
                    }
                    precision={0}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            )}
            {showExtraStats && (
              <Col xs={24} sm={12} md={8}>
                <Card>
                  <Statistic
                    title="Overrided accounting dates"
                    value={
                      processedTransactions.filter((t) => !!t.accountingDate)
                        .length
                    }
                    precision={0}
                    prefix={<CalendarOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            )}
            {showExtraStats && (
              <Col xs={24} sm={12} md={8}>
                <Card>
                  <Statistic
                    title="Ignored transactions"
                    value={
                      resolvedTransactions.length - processedTransactions.length
                    }
                    precision={0}
                    prefix={<EyeInvisibleOutlined />}
                    valueStyle={{ color: '#666' }}
                  />
                </Card>
              </Col>
            )}
          </Row>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EditOutlined />
              <span>Source:</span>
              <Select
                placeholder="Filter by source"
                value={manualFilter}
                onChange={setManualFilter}
                style={{ width: '100%', maxWidth: 150, minWidth: 120 }}
                allowClear
                options={[
                  { value: '', label: 'All' },
                  { value: 'manual', label: 'Manual' },
                  { value: 'imported', label: 'Imported' },
                ]}
              />
            </div>
            <div>&nbsp;</div>
            <Button
              icon={<PlusOutlined />}
              onClick={() => setShowManualTransactionForm(true)}
              type="primary"
            >
              Add Transaction
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadTransactions}
              loading={isLoadingTransactions}
            >
              Refresh
            </Button>
            <Switch
              checked={showExtraStats}
              onChange={onChangeShowExtraStats}
            />
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
      <ManualTransactionForm
        visible={showManualTransactionForm}
        onCancel={() => setShowManualTransactionForm(false)}
        onAdd={addTransaction}
      />
    </div>
  );
}
