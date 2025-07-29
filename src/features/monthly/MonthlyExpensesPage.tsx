'use client';

import { DatePicker } from '@/components';
import { useCategories } from '@/features/category/useCategories';
import { useTransactions } from '@/features/transactions/TransactionsContext';
import { isNotCCPayments } from '@/features/transactions/utils/isNotCCPayments';
import { isNotClaimable } from '@/features/transactions/utils/isNotClaimable';

import { useMemo, useState } from 'react';

import {
  Card,
  Col,
  Row,
  Select,
  Space,
  Statistic,
  Typography,
} from 'antd';
import { endOfDay, format, isAfter, isBefore, startOfDay, parseISO } from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';

const { Title, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

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

  // Generate monthly stacked bar data
  const monthlyData = useMemo(() => {
    const monthlyMap = new Map<string, Record<string, number>>();
    const categoryKeys = new Set<string>();

    // Group transactions by month and category
    filteredTransactions.forEach((transaction) => {
      const monthKey = format(transaction.resolvedDate, 'yyyy-MM');
      const categoryKey = transaction.parentCategoryKey;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {});
      }
      
      const monthData = monthlyMap.get(monthKey)!;
      monthData[categoryKey] = (monthData[categoryKey] || 0) + transaction.amount;
      categoryKeys.add(categoryKey);
    });

    // Convert to array format for recharts
    const sortedMonths = Array.from(monthlyMap.keys()).sort();
    
    return sortedMonths.map((monthKey) => {
      const monthData = monthlyMap.get(monthKey)!;
      const data: MonthlyData = {
        month: format(parseISO(`${monthKey}-01`), 'MMM yyyy'),
      };

      // Add each category's data
      Array.from(categoryKeys).forEach((categoryKey) => {
        const categoryName = categoryMap.get(categoryKey)?.name || 'Unknown';
        data[categoryName] = monthData[categoryKey] || 0;
      });

      return data;
    });
  }, [filteredTransactions, categoryMap]);

  // Get unique category names for legend
  const categoryNames = useMemo(() => {
    const names = new Set<string>();
    filteredTransactions.forEach((transaction) => {
      const categoryKey = transaction.parentCategoryKey;
      const categoryName = categoryMap.get(categoryKey)?.name || 'Unknown';
      names.add(categoryName);
    });
    return Array.from(names);
  }, [filteredTransactions, categoryMap]);

  // Calculate total expenses
  const totalExpense = filteredTransactions
    .reduce((sum, t) => sum + t.amount, 0)
    .toFixed(2);

  // Calculate average monthly expense
  const averageMonthlyExpense = useMemo(() => {
    if (monthlyData.length === 0) return 0;
    const total = monthlyData.reduce((sum, month) => {
      return sum + Object.keys(month).reduce((monthSum, key) => {
        if (key !== 'month') {
          return monthSum + (month[key] as number);
        }
        return monthSum;
      }, 0);
    }, 0);
    return (total / monthlyData.length).toFixed(2);
  }, [monthlyData]);

  // Custom tooltip for stacked bar chart
  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '4px'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ 
              margin: '4px 0', 
              color: entry.color,
              display: 'flex',
              justifyContent: 'space-between',
              gap: '20px'
            }}>
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
        <ResponsiveContainer width="100%" height={500}>
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
            {categoryNames.map((categoryName, index) => (
              <Bar
                key={categoryName}
                dataKey={categoryName}
                stackId="a"
                fill={categoryMap.get(
                  Array.from(categoryMap.keys()).find(key => 
                    categoryMap.get(key)?.name === categoryName
                  ) || ''
                )?.color || `#${Math.floor(Math.random()*16777215).toString(16)}`}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Data Table */}
      <Card title="Monthly Breakdown" style={{ marginTop: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Month</th>
                {categoryNames.map((categoryName) => (
                  <th key={categoryName} style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                    {categoryName}
                  </th>
                ))}
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Total</th>
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
                  <tr key={month.month} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{month.month}</td>
                    {categoryNames.map((categoryName) => (
                      <td key={categoryName} style={{ padding: '12px', textAlign: 'right' }}>
                        ${Math.abs(month[categoryName] as number).toFixed(2)}
                      </td>
                    ))}
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
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