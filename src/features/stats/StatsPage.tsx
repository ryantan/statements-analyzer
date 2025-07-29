'use client';

import { DatePicker } from '@/components';
import { useCategories } from '@/features/category/useCategories';
import { renderBarAxisTick } from '@/features/stats/components/renderBarAxisTick';
import { renderBarLabel } from '@/features/stats/components/renderBarLabel';
import { renderBarTooltip } from '@/features/stats/components/renderBarTooltip';
import { useTransactions } from '@/features/transactions/TransactionsContext';
import { isNotCCPayments } from '@/features/transactions/utils/isNotCCPayments';
import { isNotClaimable } from '@/features/transactions/utils/isNotClaimable';

import { useMemo, useState } from 'react';

import {
  Button,
  Card,
  Col,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  endOfDay,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { DrillDownModal } from './components/DrillDownModal';
import { useDrillDown } from './hooks/useDrillDown';
import { CategoryStats, PieData, TransactionForStats } from './types';

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

export function StatsPage() {
  const { categories, categoryMap } = useCategories();
  const { transactions } = useTransactions();
  const [dateRange, setDateRange] = useState<[Date | null, Date | null] | null>(
    null
  );
  const [selectedYearMonth, setSelectedYearMonth] = useState<string | null>(
    null
  );
  const {
    selectedCategory,
    isModalVisible,
    handleBarClick,
    handlePieClick,
    openModalForCategory,
    closeModal,
  } = useDrillDown();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

  // Group by parent categories
  const processedTransactions = useMemo(() => {
    return transactions
      .filter(isNotCCPayments)
      .filter(isNotClaimable)
      .map<TransactionForStats>((item) => {
        const categoryKey = item.categoryKey || item.autoCategoryKey;

        let parentCategoryKey = 'unknown';
        if (categoryKey) {
          parentCategoryKey = categoryKey.split('-')[0];
        }

        return {
          ...item,
          parentCategoryKey: parentCategoryKey,
          resolvedDate: item.accountingDate || item.date,
        };
      });
  }, [transactions]);

  // Extract available year-month options from data
  const availableYearMonths = useMemo(() => {
    const yearMonthSet = new Set<string>();

    processedTransactions.forEach((transaction) => {
      const yearMonth = format(transaction.resolvedDate, 'yyyy-MM');
      yearMonthSet.add(yearMonth);
    });

    return Array.from(yearMonthSet)
      .sort()
      .reverse() // Most recent first
      .map((yearMonth) => ({
        value: yearMonth,
        label: format(parseISO(`${yearMonth}-01`), 'MMMM yyyy'),
      }));
  }, [processedTransactions]);

  // Handle year-month selection
  const handleYearMonthChange = (value: string | null) => {
    setSelectedYearMonth(value);

    if (value) {
      const [year, month] = value.split('-');
      const startDate = startOfMonth(
        new Date(parseInt(year), parseInt(month) - 1)
      );
      const endDate = endOfMonth(new Date(parseInt(year), parseInt(month) - 1));
      setDateRange([startDate, endDate]);
    } else {
      setDateRange(null);
    }
  };

  // Handle manual date range change
  const handleDateRangeChange = (dates: [Date | null, Date | null] | null) => {
    setDateRange(dates);
    // Clear year-month selection when manually changing date range
    setSelectedYearMonth(null);
  };

  // Filter transactions by selected date range
  const filteredTransactions = useMemo(() => {
    let filtered = [...processedTransactions];

    // Apply date range filter
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = startOfDay(dateRange[0]);
      const endDate = endOfDay(dateRange[1]);
      filtered = filtered.filter((transaction) => {
        const transactionDate = transaction.resolvedDate;
        return (
          isAfter(transactionDate, startDate) &&
          isBefore(transactionDate, endDate)
        );
      });
    }

    return filtered;
  }, [processedTransactions, dateRange]);

  // Calculate category statistics
  // This is for the table.
  const categoryStats = useMemo(() => {
    const stats: CategoryStats[] = [];

    // Group transactions by category
    const categoryGroups = new Map<string, typeof filteredTransactions>();

    filteredTransactions.forEach((t) => {
      const categoryKey = t.parentCategoryKey;
      if (categoryKey) {
        if (!categoryGroups.has(categoryKey)) {
          categoryGroups.set(categoryKey, []);
        }
        categoryGroups.get(categoryKey)!.push(t);
      }
    });

    // Calculate stats for each category
    categoryGroups.forEach((transactions, categoryKey) => {
      const total = transactions.reduce((sum, t) => sum + t.amount, 0);
      const monthlyBreakdown: Record<string, number> = {};

      transactions.forEach((t) => {
        const monthKey = format(t.resolvedDate, 'MMM');
        monthlyBreakdown[monthKey] =
          (monthlyBreakdown[monthKey] || 0) + t.amount;
      });

      stats.push({
        categoryKey,
        categoryName: categoryMap.get(categoryKey)?.name || 'Unknown',
        color: categoryMap.get(categoryKey)?.color || '',
        total,
        transactionCount: transactions.length,
        averageAmount: total / transactions.length,
        monthlyBreakdown,
      });
    });

    return stats.sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  }, [filteredTransactions, categories]);

  // This is for the charts.
  const pieData = useMemo((): PieData[] => {
    const categoryTotals: Record<
      string,
      { total: number; transactionsCount: number }
    > = {};

    filteredTransactions.forEach((t) => {
      const categoryKey = t.parentCategoryKey;
      if (categoryKey) {
        if (!categoryTotals[categoryKey]) {
          categoryTotals[categoryKey] = { total: 0, transactionsCount: 0 };
        }
        categoryTotals[categoryKey].total += t.amount;
        categoryTotals[categoryKey].transactionsCount += 1;
      }
    });

    return Object.entries(categoryTotals)
      .map(([key, value]) => ({
        name: categories.find((c) => c.key === key)?.name || 'Unknown',
        value: Math.round(value.total),
        transactionsCount: Math.round(value.transactionsCount),
        color: categoryMap.get(key)?.color || '#999',
        key,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, categories]);

  const totalExpense = filteredTransactions
    .reduce((sum, t) => sum + t.amount, 0)
    .toFixed(2);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Transaction Statistics</Title>
        <Paragraph style={{ color: '#666' }}>
          Analyze your spending patterns by category and month
        </Paragraph>
      </div>

      {/* Date Range Selector */}
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Quick select:</span>
          <Select
            placeholder="Select year-month"
            value={selectedYearMonth}
            onChange={handleYearMonthChange}
            style={{ width: 180 }}
            allowClear
            showSearch
            filterOption={(input, option) =>
              String(option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {availableYearMonths.map((option) => (
              <Option
                key={option.value}
                value={option.value}
                label={option.label}
              >
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Custom date range:</span>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            placeholder={['Start date', 'End date']}
            style={{ width: '100%', maxWidth: 240, minWidth: 200 }}
            allowClear
          />
        </div>
      </div>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Total Expenses"
              value={totalExpense}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="No. of transactions"
              value={filteredTransactions.length}
              precision={2}
              valueStyle={{ color: '#333' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24}>
          <Card title="Category Distribution (Bar Chart) - Click to drill down">
            <ResponsiveContainer width="100%" height={pieData.length * 32}>
              <BarChart data={pieData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={128}
                  tick={renderBarAxisTick}
                />
                <Tooltip content={renderBarTooltip} />
                <Bar
                  dataKey="value"
                  fill="#8884d8"
                  label={renderBarLabel}
                  onClick={handleBarClick}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24}>
          <Card title="Category Distribution (Ring Chart) - Click to drill down">
            <ResponsiveContainer width="100%" height={600}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={240}
                  innerRadius={180}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={handlePieClick}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={renderBarTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Category Statistics Table */}
      <Card title="Category Breakdown">
        <Table
          dataSource={categoryStats}
          columns={[
            {
              title: 'Category',
              dataIndex: 'categoryName',
              key: 'categoryName',
              render: (name: string, record: CategoryStats) => (
                <Tag color={record.color}>{name}</Tag>
              ),
            },
            {
              title: 'Total Amount',
              dataIndex: 'total',
              key: 'total',
              render: (amount: number) => (
                <span
                  style={{
                    color: amount >= 0 ? 'green' : 'red',
                    fontWeight: 'bold',
                  }}
                >
                  ${amount.toFixed(2)}
                </span>
              ),
              sortOrder: 'descend',
              sorter: (a: CategoryStats, b: CategoryStats) => a.total - b.total,
            },
            {
              title: 'Transaction Count',
              dataIndex: 'transactionCount',
              key: 'transactionCount',
              sorter: (a: CategoryStats, b: CategoryStats) =>
                a.transactionCount - b.transactionCount,
            },
            {
              title: 'Average Amount',
              dataIndex: 'averageAmount',
              key: 'averageAmount',
              render: (amount: number) => (
                <span style={{ color: amount >= 0 ? 'green' : 'red' }}>
                  ${amount.toFixed(2)}
                </span>
              ),
              sorter: (a: CategoryStats, b: CategoryStats) =>
                a.averageAmount - b.averageAmount,
            },
            {
              title: '',
              dataIndex: 'categoryName',
              render: (_categoryName, record: CategoryStats) => (
                <Space>
                  <Button
                    onClick={() => {
                      openModalForCategory(record.categoryKey);
                    }}
                  >
                    View details
                  </Button>
                </Space>
              ),
            },
          ]}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} categories`,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (page, pageSize) => {
              setPagination({
                current: page,
                pageSize: pageSize || 20,
              });
            },
          }}
          rowKey="categoryKey"
        />
      </Card>

      {/* Drill-down Modal */}
      <DrillDownModal
        isVisible={isModalVisible}
        onClose={closeModal}
        selectedCategory={selectedCategory}
        categoryMap={categoryMap}
        transactions={filteredTransactions}
      />
    </div>
  );
}
