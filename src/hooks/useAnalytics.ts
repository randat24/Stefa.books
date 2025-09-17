'use client'

import { useCallback } from 'react'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export const useAnalytics = () => {
  const trackEvent = useCallback((action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value })
    }
  }, [])

  const trackPageView = useCallback((url: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: url })
    }
  }, [])

  const trackBookView = useCallback((bookTitle: string, bookId: string) => {
    trackEvent('book_view', 'engagement', bookTitle)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        currency: 'UAH',
        value: 0,
        items: [{
          item_id: bookId,
          item_name: bookTitle,
          category: 'books',
          item_category: 'children_books'
        }]
      })
    }
  }, [trackEvent])

  const trackBookRental = useCallback((bookTitle: string, bookId: string) => {
    trackEvent('book_rental', 'conversion', bookTitle)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        currency: 'UAH',
        value: 0,
        items: [{
          item_id: bookId,
          item_name: bookTitle,
          category: 'books',
          item_category: 'children_books'
        }]
      })
    }
  }, [trackEvent])

  const trackSubscription = useCallback((planType: string) => {
    trackEvent('subscription', 'conversion', planType)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        currency: 'UAH',
        value: 0,
        items: [{
          item_id: planType,
          item_name: `Subscription: ${planType}`,
          category: 'subscription'
        }]
      })
    }
  }, [trackEvent])

  const trackSearch = useCallback((searchTerm: string, resultsCount: number) => {
    trackEvent('search', 'engagement', searchTerm, resultsCount)
  }, [trackEvent])

  const trackUserRegistration = useCallback((method: string) => {
    trackEvent('sign_up', 'conversion', method)
  }, [trackEvent])

  const trackUserLogin = useCallback((method: string) => {
    trackEvent('login', 'engagement', method)
  }, [trackEvent])

  return {
    trackEvent,
    trackPageView,
    trackBookView,
    trackBookRental,
    trackSubscription,
    trackSearch,
    trackUserRegistration,
    trackUserLogin
  }
}
