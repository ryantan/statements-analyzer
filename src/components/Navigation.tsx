'use client';

import { Menu } from 'antd';
import { UploadOutlined, AppstoreOutlined, HomeOutlined, HistoryOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedKey, setSelectedKey] = useState<string>('home');

  useEffect(() => {
    // Set the selected key based on current pathname
    if (pathname === '/') {
      setSelectedKey('home');
    } else if (pathname === '/upload') {
      setSelectedKey('upload');
    } else if (pathname === '/categories') {
      setSelectedKey('categories');
    } else if (pathname === '/transactions') {
      setSelectedKey('transactions');
    }
  }, [pathname]);

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => router.push('/'),
    },
    {
      key: 'upload',
      icon: <UploadOutlined />,
      label: 'Upload',
      onClick: () => router.push('/upload'),
    },
    {
      key: 'transactions',
      icon: <HistoryOutlined />,
      label: 'Transactions',
      onClick: () => router.push('/transactions'),
    },
    {
      key: 'categories',
      icon: <AppstoreOutlined />,
      label: 'Categories',
      onClick: () => router.push('/categories'),
    },
  ];

  return (
    <div style={{ borderBottom: '1px solid #f0f0f0' }}>
      <Menu
        mode="horizontal"
        selectedKeys={[selectedKey]}
        items={menuItems}
        style={{ 
          display: 'flex', 
          justifyContent: 'flex-start',
          padding: '0 24px'
        }}
      />
    </div>
  );
} 