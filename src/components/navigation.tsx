'use client';

import { Menu } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UploadOutlined, TagsOutlined } from '@ant-design/icons';

const menuItems = [
  {
    key: '/',
    icon: <UploadOutlined />,
    label: <Link href="/">Upload</Link>,
  },
  {
    key: '/categories',
    icon: <TagsOutlined />,
    label: <Link href="/categories">Categories</Link>,
  },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[pathname]}
      items={menuItems}
      className="border-b"
    />
  );
}