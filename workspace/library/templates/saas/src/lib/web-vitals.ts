/**
 * @file web-vitals.ts
 * @description Core Web Vitals monitoring with INP (2024+)
 *
 * SPDX-License-Identifier: MIT
 */

import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';

type ReportHandler = (metric: Metric) => void;

/**
 * Default handler - logs to console in dev, sends to analytics in prod
 */
function defaultHandler(metric: Metric) {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    const color = metric.rating === 'good' ? '32' : metric.rating === 'needs-improvement' ? '33' : '31';
    console.log(
      `%c[Web Vital] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`,
      `color: \x1b[${color}m`
    );
  }

  // Send to analytics endpoint in production
  if (process.env.NODE_ENV === 'production') {
    sendToAnalytics(metric);
  }
}

/**
 * Send metrics to analytics endpoint using sendBeacon for reliability
 */
function sendToAnalytics(metric: Metric) {
  const body = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
    timestamp: Date.now(),
  });

  // Use sendBeacon for reliable delivery even on page unload
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body);
  } else if (typeof fetch !== 'undefined') {
    fetch('/api/analytics/vitals', {
      body,
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {
      // Silently fail - analytics should not break the app
    });
  }
}

/**
 * Initialize Web Vitals monitoring
 * @param onReport - Optional custom report handler
 */
export function initWebVitals(onReport: ReportHandler = defaultHandler) {
  // Core Web Vitals (Google Ranking Factors)
  onCLS(onReport);   // Cumulative Layout Shift
  onINP(onReport);   // Interaction to Next Paint (replaces FID since March 2024)
  onLCP(onReport);   // Largest Contentful Paint

  // Additional metrics
  onFCP(onReport);   // First Contentful Paint
  onTTFB(onReport);  // Time to First Byte
}

/**
 * Send to Google Analytics 4
 */
export function sendToGA4(metric: Metric) {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    const gtag = (window as any).gtag;
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      // GA4 expects integers, CLS is a decimal so multiply by 1000
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
      metric_rating: metric.rating,
    });
  }
}
