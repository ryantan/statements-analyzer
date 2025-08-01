'use client';

import { DatePicker } from '@/components';
import { useCategories } from '@/features/categories/useCategories';
import { renderStackBarTooltip } from '@/features/monthly/components/renderStackBarTooltip';
import { useCategoryFilter } from '@/features/monthly/hooks/useCategoryFilter';
import { useStore } from '@/store/TransactionsContext';

import { useMemo, useState } from 'react';

import { Card, Col, Row, Statistic, Typography } from 'antd';
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
  const { transactions } = useStore();
  const [dateRange, setDateRange] = useState<[Date | null, Date | null] | null>(
    null
  );

  // Filter transactions by selected date range
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

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
  }, [transactions, dateRange]);

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
  }, [filteredTransactions]);

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
  }, [originalSortedCategories, categoryMap, visibleCategories]);

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
  }, [filteredTransactions, categoryKeys, categoryMap]);

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

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <div>
        <Title level={2}>Monthly Expenses Overview</Title>
        <Paragraph style={{ color: '#666' }}>
          Track your spending patterns across months with category breakdown
        </Paragraph>
      </div>

      {/* Date Range Selector */}
      <div
        style={{
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
      <Row gutter={[16, 16]}>
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
            <Tooltip content={renderStackBarTooltip} />
            <Legend />
            {categoryKeysLargestFirst.map((categoryKey) => (
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
            <Tooltip content={renderStackBarTooltip} />
            <Legend />
            {categoryKeysLargestFirst.map((categoryKey) => (
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
            <Tooltip content={renderStackBarTooltip} />
            <Legend />
            {categoryKeysLargestFirst.map((categoryKey) => (
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
      <Card title="Monthly Breakdown">
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
