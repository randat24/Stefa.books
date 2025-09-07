'use client'

import { useEffect } from 'react'
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals'

interface WebVitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
}

// Thresholds for Web Vitals (based on Google's recommendations)
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  INP: { good: 200, poor: 500 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 }
}

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

function sendToAnalytics(metric: WebVitalMetric) {
  // Send to analytics service (Google Analytics, custom endpoint, etc.)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.rating,
      value: Math.round(metric.value),
      non_interaction: true,
    })
  }

  // Log for development and send to dashboard
  if (process.env.NODE_ENV === 'development') {
    console.log(`🚀 Web Vital - ${metric.name}:`, {
      value: `${Math.round(metric.value)}${metric.name === 'CLS' ? '' : 'ms'}`,
      rating: metric.rating,
      delta: metric.delta
    })

    // Send to performance dashboard
    window.dispatchEvent(new CustomEvent('web-vital-measured', {
      detail: metric
    }))
  }

  // Send to custom analytics endpoint
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: window.location.pathname,
        timestamp: Date.now()
      })
    }).catch(err => console.warn('Failed to send web vitals:', err))
  }
}

export default function WebVitalsTracker() {
  useEffect(() => {
    // Track Cumulative Layout Shift
    onCLS((metric) => {
      sendToAnalytics({
        name: 'CLS',
        value: metric.value,
        rating: getRating('CLS', metric.value),
        delta: metric.delta
      })
    })

    // Track Interaction to Next Paint
    onINP((metric) => {
      sendToAnalytics({
        name: 'INP',
        value: metric.value,
        rating: getRating('INP', metric.value),
        delta: metric.delta
      })
    })

    // Track First Contentful Paint
    onFCP((metric) => {
      sendToAnalytics({
        name: 'FCP',
        value: metric.value,
        rating: getRating('FCP', metric.value),
        delta: metric.delta
      })
    })

    // Track Largest Contentful Paint
    onLCP((metric) => {
      sendToAnalytics({
        name: 'LCP',
        value: metric.value,
        rating: getRating('LCP', metric.value),
        delta: metric.delta
      })
    })

    // Track Time to First Byte
    onTTFB((metric) => {
      sendToAnalytics({
        name: 'TTFB',
        value: metric.value,
        rating: getRating('TTFB', metric.value),
        delta: metric.delta
      })
    })
  }, [])

  return null // This component only tracks metrics, no UI
}

// Hook for components to track custom performance metrics
export function usePerformanceMetric(name: string, value: number) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Custom Metric - ${name}:`, `${Math.round(value)}ms`)
    }

    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/custom-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: name,
          value,
          url: window.location.pathname,
          timestamp: Date.now()
        })
      }).catch(err => console.warn('Failed to send custom metric:', err))
    }
  }, [name, value])
}