export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url })
  }
}

export const event = ({ action, category, label, value }: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value })
  }
}

// События для отслеживания
export const trackBookView = (bookId: string, bookTitle: string) => {
  event({
    action: 'view_item',
    category: 'book',
    label: bookTitle })
}

export const trackSearch = (query: string, resultsCount: number) => {
  event({
    action: 'search',
    category: 'search',
    label: query,
    value: resultsCount })
}

export const trackSubscription = (planName: string) => {
  event({
    action: 'subscribe',
    category: 'subscription',
    label: planName })
}

export const trackRental = (bookId: string, bookTitle: string) => {
  event({
    action: 'rent_book',
    category: 'rental',
    label: bookTitle })
}

export const trackCategoryView = (categoryName: string) => {
  event({
    action: 'view_category',
    category: 'category',
    label: categoryName })
}
