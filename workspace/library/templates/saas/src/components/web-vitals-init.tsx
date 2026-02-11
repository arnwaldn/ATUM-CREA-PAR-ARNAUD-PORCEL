'use client';

/**
 * @file web-vitals-init.tsx
 * @description Client component to initialize Web Vitals monitoring
 *
 * SPDX-License-Identifier: MIT
 */

import { useEffect } from 'react';
import { initWebVitals } from '@/lib/web-vitals';

export function WebVitalsInit() {
  useEffect(() => {
    initWebVitals();
  }, []);

  return null;
}
