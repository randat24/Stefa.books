"use client"

import { BookListSkeleton, BookDetailSkeleton, FormSkeleton, TableSkeleton, ProfileSkeleton } from '@/components/animations'
import { LoadingSpinner } from '@/components/animations'

interface LoadingStatesProps {
  type: 'book-list' | 'book-detail' | 'form' | 'table' | 'profile' | 'spinner'
  count?: number
  rows?: number
  columns?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingStates({ 
  type, 
  count = 6, 
  rows = 5, 
  columns = 4, 
  size = 'md',
  className = "" 
}: LoadingStatesProps) {
  switch (type) {
    case 'book-list':
      return <div className={className}><BookListSkeleton count={count} /></div>
    
    case 'book-detail':
      return <div className={className}><BookDetailSkeleton /></div>
    
    case 'form':
      return <div className={className}><FormSkeleton /></div>
    
    case 'table':
      return <div className={className}><TableSkeleton rows={rows} columns={columns} /></div>
    
    case 'profile':
      return <div className={className}><ProfileSkeleton /></div>
    
    case 'spinner':
      return <LoadingSpinner size={size} className={className} />
    
    default:
      return <LoadingSpinner size={size} className={className} />
  }
}

// Компонент для условного рендеринга с загрузкой
interface ConditionalLoadingProps {
  isLoading: boolean
  children: React.ReactNode
  loadingType?: LoadingStatesProps['type']
  loadingProps?: Partial<LoadingStatesProps>
  className?: string
}

export function ConditionalLoading({ 
  isLoading, 
  children, 
  loadingType = 'spinner',
  loadingProps = {},
  className = ""
}: ConditionalLoadingProps) {
  if (isLoading) {
    return (
      <div className={className}>
        <LoadingStates 
          type={loadingType} 
          {...loadingProps} 
        />
      </div>
    )
  }

  return <>{children}</>
}
