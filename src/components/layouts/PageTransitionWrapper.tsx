"use client"

import { PageTransition } from '@/components/animations'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PageTransitionWrapperProps {
  children: React.ReactNode
}

export function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <PageTransition className="min-h-screen">
      {children}
    </PageTransition>
  )
}
