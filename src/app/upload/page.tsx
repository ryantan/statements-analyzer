'use client';

import dynamic from 'next/dynamic';

const UploadPage = dynamic(
  () =>
    import('@/features/upload/upload').then((mod) => ({
      default: mod.UploadPage,
    })),
  {
    ssr: false,
    loading: () => <div>Loading...</div>,
  }
);

export default function Page() {
  return <UploadPage />;
}
