'use client';

import { useStore } from '@/store/Store';
import { useAvailableHeight } from '@/utils/hooks/useAvailableHeight';

import { useState } from 'react';

import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';

import { defaultCategories } from './constants';
import { Category } from './types';

const { Title, Paragraph } = Typography;
const { Search } = Input;

export function CategoriesPage() {
  const { categories, setCategories } = useStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });
  const { containerRef, availableHeight } = useAvailableHeight({
    additionalOffset: 124,
  });

  const columns = [
    {
      title: 'Key',
      dataIndex: 'key',
    },
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Category) => (
        <Space>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: record.color,
              marginRight: '8px',
            }}
          />
          {text}
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    // {
    //   title: 'Transactions',
    //   dataIndex: 'transactionCount',
    //   key: 'transactionCount',
    //   render: (count: number) => <Tag color="blue">{count}</Tag>,
    // },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: string, record: Category) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.key)}
          />
        </Space>
      ),
    },
  ];

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    setCategories(categories.filter((cat) => cat.key !== key));
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingCategory) {
        // Update existing category
        setCategories(
          categories.map((cat) =>
            cat.key === editingCategory.key ? { ...cat, ...values } : cat
          )
        );
      } else {
        // Add new category
        const newCategory = {
          key: Date.now().toString(),
          ...values,
        };
        setCategories([...categories, newCategory]);
      }
      setIsModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleLoadDefaults = () => {
    setCategories(defaultCategories);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>Transaction Categories</Title>
        <Paragraph style={{ color: '#666' }}>
          Organize your transactions into categories for better analysis and
          reporting
        </Paragraph>
      </div>

      <Card>
        <div
          style={{
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Search placeholder="Search categories..." style={{ width: 300 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
            Add Category
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleLoadDefaults}
          >
            Load defaults
          </Button>
        </div>

        <div ref={containerRef}>
          <Table
            columns={columns}
            dataSource={categories}
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
            scroll={{ x: 'max-content', y: availableHeight }}
            rowKey="key"
          />
        </div>
      </Card>

      <Modal
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingCategory ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="key"
            label="Category key"
            rules={[
              { required: true, message: 'Please enter a unique category key' },
            ]}
          >
            <Input placeholder="e.g., Groceries" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Category Name"
            rules={[
              { required: true, message: 'Please enter a category name' },
            ]}
          >
            <Input placeholder="e.g., Groceries" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input.TextArea
              placeholder="Brief description of this category"
              rows={3}
            />
          </Form.Item>
          <Form.Item
            name="color"
            label="Color"
            rules={[{ required: true, message: 'Please select a color' }]}
          >
            <Select placeholder="Select a color">
              <Select.Option value="#52c41a">Green</Select.Option>
              <Select.Option value="#1890ff">Blue</Select.Option>
              <Select.Option value="#722ed1">Purple</Select.Option>
              <Select.Option value="#fa8c16">Orange</Select.Option>
              <Select.Option value="#f5222d">Red</Select.Option>
              <Select.Option value="#13c2c2">Cyan</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
