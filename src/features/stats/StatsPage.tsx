'use client';

import { useCategories } from '@/features/category/useCategories';
import { renderBarAxisTick } from '@/features/stats/components/renderBarAxisTick';
import { useTransactions } from '@/features/transactions/useTransactions';
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
import { format } from 'date-fns';
import {
  Bar,
  BarChart,
  BarProps,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';

import { DrillDownModal } from './components/DrillDownModal';
import { useDrillDown } from './hooks/useDrillDown';
import { CategoryStats, PieData, TransactionForStats } from './types';

const { Title, Paragraph } = Typography;
const { Option } = Select;

export function StatsPage() {
  const { categories, categoryMap } = useCategories();
  const { transactions } = useTransactions();
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const {
    selectedCategory,
    isModalVisible,
    handleBarClick,
    handlePieClick,
    closeModal,
  } = useDrillDown();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

  // Get unique years from transactions
  const availableYears = useMemo(() => {
    const years = new Set(transactions.map((t) => t.date.getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  // Group by parent categories
  const processedTransactions = useMemo(() => {
    return transactions
      .filter(isNotCCPayments)
      .filter(isNotClaimable)
      .map<TransactionForStats>((item) => {
        const categoryKey = item.categoryKey || item.autoCategoryKey;
        if (!categoryKey) {
          return {
            ...item,
            parentCategoryKey: 'unknown',
          };
        }

        const parentCategoryKey = categoryKey.split('-')[0];
        return {
          ...item,
          parentCategoryKey: parentCategoryKey,
        };
      });
  }, [transactions]);

  // Filter transactions by selected year and month
  const filteredTransactions = useMemo(() => {
    let filtered = processedTransactions.filter(
      (t) => t.date.getFullYear() === selectedYear
    );

    if (selectedMonth !== null) {
      filtered = filtered.filter((t) => t.date.getMonth() === selectedMonth);
    }

    return filtered;
  }, [processedTransactions, selectedYear, selectedMonth]);

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
        const monthKey = format(t.date, 'MMM');
        monthlyBreakdown[monthKey] =
          (monthlyBreakdown[monthKey] || 0) + t.amount;
      });

      stats.push({
        categoryKey,
        categoryName: categoryMap.get(categoryKey)?.name || 'Unknown',
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

  // Render a custom tooltip for bar chart displaying total and number of transactions.
  const renderBarTooltip: TooltipProps<any, any>['content'] = (props) => {
    const { active, payload, label } = props;
    const items = payload as { payload: PieData }[];
    const isVisible = active && items && items.length;
    if (!isVisible) {
      return (
        <div
          className="bar-chart-tooltip"
          style={{
            visibility: 'hidden',
            background: '#fff',
          }}
        ></div>
      );
    }

    const firstDataItem = items[0].payload;
    return (
      <div
        className="bar-chart-tooltip"
        style={{
          visibility: 'visible',
          background: '#fff',
          padding: 16,
        }}
      >
        <strong>{label}</strong>
        <p className="label">${firstDataItem.value}</p>
        <p className="intro">{firstDataItem.transactionsCount} Transactions</p>
      </div>
    );
  };

  // Render the total amount on the right of the bars.
  const renderCustomBarLabel: BarProps['label'] = (props) => {
    const { x, y, width, height, value } = props;
    const offsetX = width + 10; // Adjust offset based on width

    return (
      <text
        x={x + offsetX}
        y={y + height / 2}
        fill="#666"
        textAnchor="left"
        dominantBaseline="central"
      >
        ${value}
      </text>
    );
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Transaction Statistics</Title>
        <Paragraph style={{ color: '#666' }}>
          Analyze your spending patterns by category and month
        </Paragraph>
      </div>

      {/* Year and Month Selector */}
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <div>
          <span style={{ marginRight: '8px' }}>Year:</span>
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            style={{ width: 120 }}
          >
            {availableYears.map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </div>
        <div>
          <span style={{ marginRight: '8px' }}>Month:</span>
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            style={{ width: 120 }}
            allowClear
            placeholder="All months"
          >
            <Option value={0}>January</Option>
            <Option value={1}>February</Option>
            <Option value={2}>March</Option>
            <Option value={3}>April</Option>
            <Option value={4}>May</Option>
            <Option value={5}>June</Option>
            <Option value={6}>July</Option>
            <Option value={7}>August</Option>
            <Option value={8}>September</Option>
            <Option value={9}>October</Option>
            <Option value={10}>November</Option>
            <Option value={11}>December</Option>
          </Select>
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
                  label={renderCustomBarLabel}
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
                <Tag color={record.total > 0 ? 'green' : 'red'}>{name}</Tag>
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
                  <Button>View details</Button>
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
