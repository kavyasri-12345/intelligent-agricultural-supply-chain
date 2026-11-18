"use client";

import React from 'react';
import OriginalAuthView from '@/components/OriginalAuthView';

/**
 * Root Landing Page (/)
 * Per project specification: The original login page serves as the default landing page.
 * Whenever anyone opens the website URL, this is the first page they see.
 * Authenticated users are automatically routed to their respective role dashboard.
 */
export default function HomePage() {
  return <OriginalAuthView initialMode="login" />;
}
