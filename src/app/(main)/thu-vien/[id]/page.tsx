import React from 'react';
import type { Metadata } from 'next';
import LibraryDetailClient from './LibraryDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  // In a real app, you would fetch the library data here
  return {
    title: `Chi tiết thư viện - Step V Studio`,
    description: 'Chi tiết tài nguyên sáng tạo từ thư viện Step V Studio',
  };
}

export default async function LibraryDetailPage({ params }: Props) {
  const { id } = await params;
  return <LibraryDetailClient id={id} />;
}
