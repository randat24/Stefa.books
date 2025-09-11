'use client'

import { useState, useEffect } from 'react'
import { X, Cookie } from 'lucide-react'

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowConsent(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setShowConsent(false)
    // Включить Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      })
    }
  }

  const rejectCookies = () => {
    localStorage.setItem('cookie-consent', 'rejected')
    setShowConsent(false)
    // Отключить Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      })
    }
  }

  if (!showConsent) return null

  return (
    <>
      {/* Cookie consent modal */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-white p-6 rounded-lg shadow-xl border border-gray-200 z-50 animate-in slide-in-from-bottom-4">
      <div className="flex items-start gap-3">
        <Cookie className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-900 mb-2">
            Використання cookies
          </h3>
          <p className="text-body-sm text-neutral-700 mb-4">
            Ми використовуємо cookies для аналітики та покращення роботи сайту. 
            Продовжуючи використання сайту, ви погоджуєтесь з нашою політикою cookies.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={acceptCookies}
              className="px-4 py-2 bg-[var(--brand)] text-[#111827] rounded-md text-body-sm font-medium hover:bg-[var(--brand-600)] transition-colors shadow-md hover:shadow-lg"
            >
              Прийняти всі
            </button>
            <button
              onClick={rejectCookies}
              className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-md text-body-sm font-medium hover:bg-neutral-300 transition-colors"
            >
              Відхилити
            </button>
          </div>
        </div>
        <button
          onClick={rejectCookies}
          className="text-neutral-400 hover:text-neutral-600 transition-colors"
          aria-label="Закрити"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      </div>
    </>
  )
}
