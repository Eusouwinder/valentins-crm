'use client';

import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/PageLoader';

const MessagingPage = dynamic(
  () => import('@/features/messaging/MessagingPage').then((m) => ({ default: m.MessagingPage })),
  { loading: () => <PageLoader />, ssr: false }
);

export default function Messaging() {
  return <MessagingPage />;
}
