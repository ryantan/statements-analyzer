'use client';

import { DatePicker } from '@/components';
import { useCategories } from '@/features/category/useCategories';
import { useCategoryFilter } from '@/features/monthly/hooks/useCategoryFilter';
import { useTransactions } from '@/features/transactions/TransactionsContext';
import { isNotCCPayments } from '@/features/transactions/utils/isNotCCPayments';
import { isNotClaimable } from '@/features/transactions/utils/isNotClaimable';

import { useMemo, useState } from 'react';

import {
  // Keep vertical
  Card,
  Col,
  Row,
  Statistic,
  Typography,
} from 'antd';
import {
  endOfDay,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
} from 'date-fns';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;

interface MonthlyData {
  month: string;
  [key: string]: string | number;
}

export function MonthlyExpensesPage() {
  const { categories, categoryMap } = useCategories();
  const { transactions } = useTransactions();
  const [dateRange, setDateRange] = useState<[Date | null, Date | null] | null>(
    null
  );

  // Process transactions
  const processedTransactions = useMemo(() => {
    return transactions
      .filter(isNotCCPayments)
      .filter(isNotClaimable)
      .map((item) => {
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

  // Filter transactions by selected date range
  const filteredTransactions = useMemo(() => {
    let filtered = [...processedTransactions];

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

  // Get unique category names for legend (sorted by total amount across all months)
  const {
    // Keep vertical.
    originalSortedCategories,
    originalSortedCategoryKeys,
  } = useMemo(() => {
    // Key = category key, value = total.
    const categoryTotals = new Map<string, number>();

    filteredTransactions.forEach((transaction) => {
      const categoryKey = transaction.parentCategoryKey;
      categoryTotals.set(
        categoryKey,
        (categoryTotals.get(categoryKey) || 0) + transaction.amount
      );
    });

    const originalSortedCategories = Array.from(categoryTotals.entries()).sort(
      (a, b) => Math.abs(a[1]) - Math.abs(b[1])
    );
    const originalSortedCategoryKeys = originalSortedCategories.map(
      ([key]) => key
    );
    return { originalSortedCategories, originalSortedCategoryKeys };
  }, [filteredTransactions, categoryMap]);

  const { visibleCategories, renderCategoriesFilter } = useCategoryFilter(
    categories,
    categoryMap,
    originalSortedCategoryKeys
  );

  const {
    // Keep vertical.
    categoryKeysLargestFirst,
    categoryKeys,
  } = useMemo(() => {
    const sortedCategories = originalSortedCategories.filter(([key]) =>
      visibleCategories.has(key)
    );

    const categoryKeys = sortedCategories.map(([key]) => key);
    const categoryNames = sortedCategories.map(
      ([key]) => categoryMap.get(key)?.name || 'Unknown'
    );
    const categoryKeysLargestFirst = categoryKeys.toReversed();
    const categoryNamesLargestFirst = categoryNames.toReversed();

    return {
      categoryKeys,
      categoryNames,
      categoryKeysLargestFirst,
      categoryNamesLargestFirst,
    };
  }, [
    originalSortedCategories,
    originalSortedCategoryKeys,
    filteredTransactions,
    categoryMap,
    visibleCategories,
  ]);

  // Generate monthly stacked bar data
  const monthlyData = useMemo(() => {
    // Key = yyyy-MM, value = { categoryKey: amount }
    const monthlyMap = new Map<string, Record<string, number>>();

    // Group transactions by month and category
    filteredTransactions.forEach((transaction) => {
      const monthKey = format(transaction.resolvedDate, 'yyyy-MM');
      const categoryKey = transaction.parentCategoryKey;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {});
      }

      const monthData = monthlyMap.get(monthKey)!;
      monthData[categoryKey] =
        (monthData[categoryKey] || 0) + transaction.amount;
    });

    // Convert to array format for recharts
    const sortedMonths = Array.from(monthlyMap.keys()).sort();

    return sortedMonths.map((monthKey) => {
      const monthData = monthlyMap.get(monthKey)!;
      const data: MonthlyData = {
        month: format(parseISO(`${monthKey}-01`), 'MMM yyyy'),
      };

      categoryKeys
        .map((categoryKey) => ({
          key: categoryKey,
          name: categoryMap.get(categoryKey)?.name || 'Unknown',
          // Ensure amount is never negative.
          amount: Math.max(0, monthData[categoryKey] || 0),
        }))
        .forEach(({ key, amount }) => {
          data[key] = amount;
        });

      return data;
    });
  }, [filteredTransactions, categoryMap]);

  console.log('monthlyData:', monthlyData);

  // Calculate total expenses
  const totalExpense = filteredTransactions
    .reduce((sum, t) => sum + t.amount, 0)
    .toFixed(2);

  // Calculate average monthly expense
  const averageMonthlyExpense = useMemo(() => {
    if (monthlyData.length === 0) return 0;
    const total = monthlyData.reduce((sum, month) => {
      return (
        sum +
        Object.keys(month).reduce((monthSum, key) => {
          if (key !== 'month') {
            return monthSum + (month[key] as number);
          }
          return monthSum;
        }, 0)
      );
    }, 0);
    return (total / monthlyData.length).toFixed(2);
  }, [monthlyData]);

  // Custom tooltip for stacked bar chart
  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            padding: '10px',
            borderRadius: '4px',
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              style={{
                margin: '4px 0',
                color: entry.color,
                display: 'flex',
                justifyContent: 'space-between',
                gap: '20px',
              }}
            >
              <span>{entry.name}:</span>
              <span style={{ fontWeight: 'bold' }}>
                ${Math.abs(entry.value).toFixed(2)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Monthly Expenses Overview</Title>
        <Paragraph style={{ color: '#666' }}>
          Track your spending patterns across months with category breakdown
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
          <span>Date range:</span>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder={['Start date', 'End date']}
            style={{ width: '100%', maxWidth: 240, minWidth: 200 }}
            allowClear
          />
        </div>
      </div>

      {renderCategoriesFilter()}

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
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
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Average Monthly"
              value={averageMonthlyExpense}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Months Covered"
              value={monthlyData.length}
              valueStyle={{ color: '#333' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Stacked Bar Chart */}
      <Card title="Monthly Expenses by Category">
        <ResponsiveContainer width="100%" height={700}>
          <BarChart
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value) => `$${Math.abs(value).toLocaleString()}`}
            />
            <Tooltip content={renderTooltip} />
            <Legend />
            {categoryKeys.map((categoryKey) => (
              <Bar
                key={categoryKey}
                dataKey={categoryKey}
                stackId="a"
                fill={categoryMap.get(categoryKey)?.color || `black`}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Stacked Area Chart */}
      <Card title="Monthly Expenses by Category">
        <ResponsiveContainer width="100%" height={700}>
          <AreaChart
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value) => `$${Math.abs(value).toLocaleString()}`}
            />
            <Tooltip content={renderTooltip} />
            <Legend />
            {categoryKeys.map((categoryKey) => (
              <Area
                connectNulls
                key={categoryKey}
                type="bump"
                dataKey={categoryKey}
                stackId="a"
                fill={categoryMap.get(categoryKey)?.color || `black`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Stacked Area Chart */}
      <Card title="Monthly Expenses by Category (Percentage)">
        <ResponsiveContainer width="100%" height={700}>
          <AreaChart
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            stackOffset="expand"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value) => `$${Math.abs(value).toLocaleString()}`}
            />
            <Tooltip content={renderTooltip} />
            <Legend />
            {categoryKeys.map((categoryKey) => (
              <Area
                connectNulls
                key={categoryKey}
                type="bump"
                dataKey={categoryKey}
                stackId="a"
                fill={categoryMap.get(categoryKey)?.color || `black`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Data Table */}
      <Card title="Monthly Breakdown" style={{ marginTop: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: 'bold',
                  }}
                >
                  Month
                </th>
                {categoryKeysLargestFirst.map((categoryKey) => (
                  <th
                    key={categoryKey}
                    style={{
                      padding: '12px',
                      textAlign: 'right',
                      fontWeight: 'bold',
                    }}
                  >
                    {categoryMap.get(categoryKey)?.name || 'Unknown'}
                  </th>
                ))}
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'right',
                    fontWeight: 'bold',
                  }}
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((month) => {
                const monthTotal = Object.keys(month).reduce((sum, key) => {
                  if (key !== 'month') {
                    return sum + (month[key] as number);
                  }
                  return sum;
                }, 0);

                return (
                  <tr
                    key={month.month}
                    style={{ borderBottom: '1px solid #f0f0f0' }}
                  >
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>
                      {month.month}
                    </td>
                    {categoryKeysLargestFirst.map((categoryKey) => (
                      <td
                        key={categoryKey}
                        style={{ padding: '12px', textAlign: 'right' }}
                      >
                        ${Math.abs(month[categoryKey] as number).toFixed(2)}
                      </td>
                    ))}
                    <td
                      style={{
                        padding: '12px',
                        textAlign: 'right',
                        fontWeight: 'bold',
                      }}
                    >
                      ${Math.abs(monthTotal).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
