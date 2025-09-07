'use client'

import { useEffect } from 'react'

interface ResourcePreloaderProps {
  // Critical images to preload (for LCP optimization)
  criticalImages?: string[]
  
  // Critical fonts to preload
  criticalFonts?: Array<{
    href: string
    type?: string
    crossOrigin?: 'anonymous' | 'use-credentials'
  }>
  
  // Critical CSS to preload
  criticalCSS?: string[]
  
  // Critical JS chunks to preload
  criticalJS?: string[]
  
  // Enable DNS prefetching for external domains
  dnsPrefetch?: string[]
  
  // Enable preconnect for external domains
  preconnect?: string[]
}

export default function ResourcePreloader({
  criticalImages = [],
  criticalFonts = [],
  criticalCSS = [],
  criticalJS = [],
  dnsPrefetch = [],
  preconnect = []
}: ResourcePreloaderProps) {
  
  useEffect(() => {
    // Preload critical images
    criticalImages.forEach(src => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
    })

    // Preload critical fonts
    criticalFonts.forEach(font => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'font'
      link.href = font.href
      link.type = font.type || 'font/woff2'
      if (font.crossOrigin) {
        link.crossOrigin = font.crossOrigin
      }
      document.head.appendChild(link)
    })

    // Preload critical CSS
    criticalCSS.forEach(href => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = href
      document.head.appendChild(link)
    })

    // Preload critical JavaScript chunks
    criticalJS.forEach(href => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'script'
      link.href = href
      document.head.appendChild(link)
    })

    // DNS prefetch for external domains
    dnsPrefetch.forEach(domain => {
      const link = document.createElement('link')
      link.rel = 'dns-prefetch'
      link.href = domain
      document.head.appendChild(link)
    })

    // Preconnect for external domains
    preconnect.forEach(domain => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = domain
      document.head.appendChild(link)
    })

    // Cleanup function to remove added links
    return () => {
      // Remove preload links when component unmounts
      const preloadLinks = document.querySelectorAll('link[rel="preload"]')
      const prefetchLinks = document.querySelectorAll('link[rel="dns-prefetch"]')
      const preconnectLinks = document.querySelectorAll('link[rel="preconnect"]')
      
      ;[...preloadLinks, ...prefetchLinks, ...preconnectLinks].forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link)
        }
      })
    }
  }, [criticalImages, criticalFonts, criticalCSS, criticalJS, dnsPrefetch, preconnect])

  return null // This component doesn't render anything
}

// Specialized preloader for the homepage
export function HomepageResourcePreloader() {
  return (
    <ResourcePreloader
      criticalImages={[
        '/images/hero-bg.jpg',
        '/images/books/featured-1.jpg',
        '/images/books/featured-2.jpg',
        '/images/books/featured-3.jpg'
      ]}
      criticalFonts={[
        {
          href: '/fonts/inter-var.woff2',
          type: 'font/woff2',
          crossOrigin: 'anonymous'
        }
      ]}
      dnsPrefetch={[
        'https://res.cloudinary.com',
        'https://www.google-analytics.com',
        'https://googletagmanager.com'
      ]}
      preconnect={[
        'https://res.cloudinary.com',
        'https://hvqvtaidguxlmqibomov.supabase.co'
      ]}
    />
  )
}

// Specialized preloader for book pages
export function BookPageResourcePreloader({ bookCoverUrl }: { bookCoverUrl?: string }) {
  return (
    <ResourcePreloader
      criticalImages={bookCoverUrl ? [bookCoverUrl] : []}
      dnsPrefetch={[
        'https://res.cloudinary.com'
      ]}
      preconnect={[
        'https://res.cloudinary.com',
        'https://hvqvtaidguxlmqibomov.supabase.co'
      ]}
    />
  )
}

// Hook to preload resources programmatically
export function useResourcePreload() {
  const preloadImage = (src: string) => {
    const img = new Image()
    img.src = src
    return new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })
  }

  const preloadFont = (href: string, type = 'font/woff2') => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.href = href
    link.type = type
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  }

  const preloadScript = (src: string) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve(void 0)
        return
      }

      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve(void 0)
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  const preloadCSS = (href: string) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`link[href="${href}"]`)) {
        resolve(void 0)
        return
      }

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.onload = () => resolve(void 0)
      link.onerror = reject
      document.head.appendChild(link)
    })
  }

  return {
    preloadImage,
    preloadFont,
    preloadScript,
    preloadCSS
  }
}