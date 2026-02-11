/**
 * @file web-vitals.ts
 * @description Core Web Vitals for e-commerce - Full monitoring with alerts
 *
 * SPDX-License-Identifier: MIT
 */

import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';

/**
 * Initialize Web Vitals monitoring for e-commerce
 * Tracks all metrics and alerts on poor performance
 */
export function initWebVitals() {
  const reportMetric = (metric: Metric) => {
    // Log in development with colored output
    if (process.env.NODE_ENV === 'development') {
      const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
      console.log(`${emoji} [Web Vital] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
    }

    // Alert on poor performance in production
    if (process.env.NODE_ENV === 'production' && metric.rating === 'poor') {
      console.error(`[PERF ALERT] ${metric.name} is ${metric.rating}: ${metric.value}`);

      // Send to error monitoring if available (Sentry, etc.)
      if (typeof window !== 'undefined' && 'Sentry' in window) {
        (window as any).Sentry.captureMessage(
          `Poor ${metric.name}: ${metric.value.toFixed(2)}`,
          'warning'
        );
      }
    }

    // Send to Google Analytics 4 if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as any).gtag;
      gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
        metric_rating: metric.rating,
      });
    }

    // Send to analytics endpoint
    sendToAnalytics(metric);
  };

  // Core Web Vitals (Google Ranking Factors)
  onCLS(reportMetric);   // Cumulative Layout Shift
  onINP(reportMetric);   // Interaction to Next Paint (replaces FID)
  onLCP(reportMetric);   // Largest Contentful Paint

  // Additional metrics important for e-commerce
  onFCP(reportMetric);   // First Contentful Paint
  onTTFB(reportMetric);  // Time to First Byte
}

/**
 * Send metrics to analytics endpoint
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
    url: typeof window !== 'undefined' ? window.location.pathname : '',
  });

  // Use sendBeacon for reliable delivery
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/vitals', body);
  }
}
