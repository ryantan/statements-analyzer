import { defaultCategories } from '@/features/categories/constants';
import { Transaction } from '@/features/transactions/types';

import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
} from 'antd';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface ManualTransactionFormProps {
  visible: boolean;
  onCancel: () => void;
  onAdd: (transaction: Transaction) => void;
}

export function ManualTransactionForm({
  visible,
  onCancel,
  onAdd,
}: ManualTransactionFormProps) {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const date = values.date.toDate();
      const transaction: Transaction = {
        key: uuidv4(),
        day: format(date, 'd'),
        month: format(date, 'MMM'),
        year: date.getFullYear(),
        date: date,
        dateFormatted: format(date, 'dd MMM yyyy'),
        description: [values.description],
        amount: values.amount,
        amountFormatted: values.amount.toFixed(2),
        categoryKey: values.categoryKey,
        remarks: values.remarks,
        claimable: values.claimable || false,
        bank: values.bank || 'Cash',
        bankAccount: values.bankAccount || 'Cash',
        isManual: true,
      };

      onAdd(transaction);
      form.resetFields();
      onCancel();
    });
  };

  return (
    <Modal
      title="Add Manual Transaction"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Add Transaction
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="date"
          label="Date"
          rules={[{ required: true, message: 'Please select a date' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter a description' }]}
        >
          <Input placeholder="Enter transaction description" />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount"
          rules={[{ required: true, message: 'Please enter an amount' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter amount (negative for expenses)"
            precision={2}
          />
        </Form.Item>

        <Form.Item name="categoryKey" label="Category">
          <Select
            placeholder="Select a category"
            showSearch
            optionFilterProp="children"
          >
            {defaultCategories.map((category) => (
              <Select.Option key={category.key} value={category.key}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="bank" label="Bank">
          <Input placeholder="Enter bank name (default: Cash)" />
        </Form.Item>

        <Form.Item name="bankAccount" label="Bank Account">
          <Input placeholder="Enter bank account (default: Cash)" />
        </Form.Item>

        <Form.Item name="remarks" label="Remarks">
          <Input.TextArea rows={2} placeholder="Enter any remarks" />
        </Form.Item>

        <Form.Item name="claimable" valuePropName="checked">
          <Checkbox>Claimable</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
}
