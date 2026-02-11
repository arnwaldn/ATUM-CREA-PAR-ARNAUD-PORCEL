/**
 * @file web-vitals.ts
 * @description Core Web Vitals for landing pages - SEO optimized
 *
 * SPDX-License-Identifier: MIT
 */

import { onCLS, onINP, onLCP } from 'web-vitals';
import type { Metric } from 'web-vitals';

/**
 * Initialize Core Web Vitals for landing pages
 * Only tracks the 3 main metrics that affect Google ranking
 */
export function initWebVitals() {
  const reportMetric = (metric: Metric) => {
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
      console.log(`${emoji} [Web Vital] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
    }

    // Send to Google Analytics 4 if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag;
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      });
    }
  };

  // Core Web Vitals only (Google Ranking Factors)
  onCLS(reportMetric);   // Cumulative Layout Shift
  onINP(reportMetric);   // Interaction to Next Paint (replaces FID)
  onLCP(reportMetric);   // Largest Contentful Paint
}
