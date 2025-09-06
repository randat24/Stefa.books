'use client'

import Script from 'next/script'
import { useEffect } from 'react'

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

export function GoogleAnalytics() {
  useEffect(() => {
    // Настройка согласия на cookies по умолчанию
    if (typeof window !== 'undefined') {
      // Ждем загрузки gtag
      const checkGtag = () => {
        if (window.gtag) {
          const consent = localStorage.getItem('cookie-consent')
          window.gtag('consent', 'default', {
            analytics_storage: consent === 'accepted' ? 'granted' : 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
          })
        } else {
          // Повторяем попытку через 100ms
          setTimeout(checkGtag, 100)
        }
      }
      checkGtag()
    }
  }, [])

  if (!GA_TRACKING_ID) {
    console.warn('Google Analytics ID не найден. Добавьте NEXT_PUBLIC_GA_ID в .env.local')
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            
            // Настройка согласия на cookies
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied'
            });
            
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
              send_page_view: true,
              anonymize_ip: true,
              allow_google_signals: true,
              allow_ad_personalization_signals: false
            });
          `,
        }}
      />
    </>
  )
}
