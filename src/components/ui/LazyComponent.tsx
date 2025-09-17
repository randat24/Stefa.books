'use client'

import { Suspense, lazy, ComponentType , ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface LazyComponentProps {
  fallback?: React.ReactNode
  className?: string
  children: React.ReactNode
}

// Skeleton компоненты для разных типов контента
const BookCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 animate-pulse">
    <div className="w-full h-48 bg-neutral-200 rounded-md mb-4" />
    <div className="space-y-2">
      <div className="h-4 bg-neutral-200 rounded w-3/4" />
      <div className="h-3 bg-neutral-200 rounded w-1/2" />
      <div className="h-3 bg-neutral-200 rounded w-1/4" />
    </div>
  </div>
)

const BookListSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <BookCardSkeleton key={i} />
    ))}
  </div>
)

const FormSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="space-y-2">
      <div className="h-4 bg-neutral-200 rounded w-1/4" />
      <div className="h-10 bg-neutral-200 rounded" />
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-neutral-200 rounded w-1/3" />
      <div className="h-10 bg-neutral-200 rounded" />
    </div>
    <div className="h-10 bg-neutral-200 rounded w-1/2" />
  </div>
)

const TableSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    <div className="h-4 bg-neutral-200 rounded w-full" />
    <div className="h-4 bg-neutral-200 rounded w-5/6" />
    <div className="h-4 bg-neutral-200 rounded w-4/6" />
    <div className="h-4 bg-neutral-200 rounded w-3/6" />
  </div>
)

const NavigationSkeleton = () => (
  <div className="flex space-x-4 animate-pulse">
    <div className="h-6 bg-neutral-200 rounded w-16" />
    <div className="h-6 bg-neutral-200 rounded w-20" />
    <div className="h-6 bg-neutral-200 rounded w-14" />
    <div className="h-6 bg-neutral-200 rounded w-18" />
  </div>
)

const ProfileSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="w-16 h-16 bg-neutral-200 rounded-2xl" />
      <div className="space-y-2">
        <div className="h-4 bg-neutral-200 rounded w-32" />
        <div className="h-3 bg-neutral-200 rounded w-24" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-neutral-200 rounded w-full" />
      <div className="h-4 bg-neutral-200 rounded w-3/4" />
    </div>
  </div>
)

// Функция для создания ленивого компонента
export function createLazyComponent<T = Record<string, any>>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallbackType: 'book-card' | 'book-list' | 'form' | 'table' | 'navigation' | 'profile' = 'book-card'
) {
  const LazyComponent = lazy(importFunc)
  
  const getFallback = () => {
    switch (fallbackType) {
      case 'book-card':
        return <BookCardSkeleton />
      case 'book-list':
        return <BookListSkeleton />
      case 'form':
        return <FormSkeleton />
      case 'table':
        return <TableSkeleton />
      case 'navigation':
        return <NavigationSkeleton />
      case 'profile':
        return <ProfileSkeleton />
      default:
        return <BookCardSkeleton />
    }
  }

  return function WrappedLazyComponent(props: T) {
    return (
      <Suspense fallback={getFallback()}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    )
  }
}

// Основной компонент для ленивой загрузки
export default function LazyComponent({ 
  fallback, 
  className, 
  children 
}: LazyComponentProps) {
  return (
    <Suspense 
      fallback={
        fallback || (
          <div className={cn('animate-pulse', className)}>
            <div className="h-4 bg-neutral-200 rounded w-full mb-2" />
            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-neutral-200 rounded w-1/2" />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  )
}

// Экспорт скелетонов для использования в других компонентах
export {
  BookCardSkeleton,
  BookListSkeleton,
  FormSkeleton,
  TableSkeleton,
  NavigationSkeleton,
  ProfileSkeleton }
