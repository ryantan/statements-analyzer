'use client';

import Link from 'next/link';

import { AppstoreOutlined, UploadOutlined, HistoryOutlined, BarChartOutlined, CalendarOutlined } from '@ant-design/icons';
import { Button, Card, Col, Flex, Row, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export const Home = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <Title level={1}>Statements Analyzer</Title>
        <Paragraph style={{ fontSize: '18px', color: '#666' }}>
          Upload and analyze your financial statements with ease
        </Paragraph>
      </div>

      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} sm={12} md={8}>
          <Card hoverable>
            <Flex
              align="center"
              gap={16}
              vertical
              style={{ textAlign: 'center' }}
            >
              <UploadOutlined
                style={{
                  fontSize: '48px',
                  color: '#1890ff',
                  marginBottom: '16px',
                }}
              />
              <Title level={3}>Upload Statements</Title>
              <Paragraph>
                Upload your PDF statements to extract and analyze transactions
              </Paragraph>
              <Link href="/upload">
                <Button type="primary" size="large">
                  Get Started
                </Button>
              </Link>
            </Flex>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card hoverable>
            <Flex
              align="center"
              gap={16}
              vertical
              style={{ textAlign: 'center' }}
            >
              <HistoryOutlined
                style={{
                  fontSize: '48px',
                  color: '#52c41a',
                  marginBottom: '16px',
                }}
              />
              <Title level={3}>View Transactions</Title>
              <Paragraph>
                Browse and manage your stored transaction history
              </Paragraph>
              <Link href="/transactions">
                <Button type="primary" size="large">
                  View History
                </Button>
              </Link>
            </Flex>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card hoverable>
            <Flex
              align="center"
              gap={16}
              vertical
              style={{ textAlign: 'center' }}
            >
              <AppstoreOutlined
                style={{
                  fontSize: '48px',
                  color: '#52c41a',
                  marginBottom: '16px',
                }}
              />
              <Title level={3}>Manage Categories</Title>
              <Paragraph>
                Organize and categorize your transactions for better analysis
              </Paragraph>
              <Link href="/categories">
                <Button type="primary" size="large">
                  View Categories
                </Button>
              </Link>
            </Flex>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card hoverable>
            <Flex
              align="center"
              gap={16}
              vertical
              style={{ textAlign: 'center' }}
            >
              <BarChartOutlined
                style={{
                  fontSize: '48px',
                  color: '#722ed1',
                  marginBottom: '16px',
                }}
              />
              <Title level={3}>View Statistics</Title>
              <Paragraph>
                Analyze spending patterns and category distributions
              </Paragraph>
              <Link href="/stats">
                <Button type="primary" size="large">
                  View Statistics
                </Button>
              </Link>
            </Flex>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card hoverable>
            <Flex
              align="center"
              gap={16}
              vertical
              style={{ textAlign: 'center' }}
            >
              <CalendarOutlined
                style={{
                  fontSize: '48px',
                  color: '#fa8c16',
                  marginBottom: '16px',
                }}
              />
              <Title level={3}>Monthly Overview</Title>
              <Paragraph>
                Track expenses across months with stacked bar charts
              </Paragraph>
              <Link href="/monthly">
                <Button type="primary" size="large">
                  View Monthly
                </Button>
              </Link>
            </Flex>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
