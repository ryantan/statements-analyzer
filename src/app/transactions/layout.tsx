'use client';

import { usePathname, useRouter } from 'next/navigation';

import { Menu } from 'antd';

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (key: string) => {
    router.push(key);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Menu
        mode="horizontal"
        selectedKeys={[pathname]}
        onClick={({ key }) => handleClick(key)}
        style={{ marginBottom: '24px' }}
        items={[
          {
            key: '/transactions',
            label: 'View Transactions',
          },
          {
            key: '/transactions/operations',
            label: 'Operations',
          },
        ]}
      />
      {children}
    </div>
  );
}
