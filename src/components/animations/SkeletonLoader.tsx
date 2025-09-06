"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ReactNode } from "react"

interface SkeletonLoaderProps {
  className?: string
  children?: ReactNode
}

// Базовый скелетон с анимацией
export function SkeletonLoader({ className = "", children }: SkeletonLoaderProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={`bg-gray-200 rounded ${className}`}
      animate={shouldReduceMotion ? {} : { 
        opacity: [0.5, 1, 0.5] 
      }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
    >
      {children}
    </motion.div>
  )
}

// Скелетон для карточки книги
export function BookCardSkeleton() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className="bg-white rounded-xl shadow-card border border-gray-100 p-4 h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Обложка книги */}
      <SkeletonLoader className="w-full h-64 rounded-lg mb-4" />
      
      {/* Название */}
      <SkeletonLoader className="h-6 w-3/4 mb-2" />
      
      {/* Автор */}
      <SkeletonLoader className="h-4 w-1/2 mb-4" />
      
      {/* Кнопка */}
      <SkeletonLoader className="h-10 w-full rounded-lg" />
    </motion.div>
  )
}

// Скелетон для списка книг
export function BookListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3, 
            delay: index * 0.1 
          }}
        >
          <BookCardSkeleton />
        </motion.div>
      ))}
    </div>
  )
}

// Скелетон для детальной страницы книги
export function BookDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - изображения */}
        <div className="space-y-4">
          <SkeletonLoader className="w-full h-96 rounded-xl" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonLoader key={index} className="w-full h-20 rounded-lg" />
            ))}
          </div>
        </div>
        
        {/* Правая колонка - информация */}
        <div className="space-y-6">
          <div>
            <SkeletonLoader className="h-8 w-3/4 mb-2" />
            <SkeletonLoader className="h-6 w-1/2 mb-4" />
            <SkeletonLoader className="h-4 w-full mb-2" />
            <SkeletonLoader className="h-4 w-5/6 mb-2" />
            <SkeletonLoader className="h-4 w-4/6" />
          </div>
          
          <div className="space-y-3">
            <SkeletonLoader className="h-6 w-1/3" />
            <SkeletonLoader className="h-4 w-full" />
            <SkeletonLoader className="h-4 w-3/4" />
          </div>
          
          <div className="space-y-3">
            <SkeletonLoader className="h-6 w-1/4" />
            <SkeletonLoader className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Скелетон для формы
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <SkeletonLoader className="h-4 w-1/4" />
          <SkeletonLoader className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <SkeletonLoader className="h-12 w-full rounded-lg" />
    </div>
  )
}

// Скелетон для таблицы
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLoader 
              key={colIndex} 
              className={`h-8 flex-1 ${colIndex === 0 ? 'w-1/4' : ''}`} 
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Скелетон для навигации
export function NavigationSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <SkeletonLoader className="h-8 w-32" />
      <SkeletonLoader className="h-8 w-24" />
      <SkeletonLoader className="h-8 w-24" />
      <SkeletonLoader className="h-8 w-24" />
    </div>
  )
}

// Скелетон для профиля пользователя
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <SkeletonLoader className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <SkeletonLoader className="h-6 w-32" />
          <SkeletonLoader className="h-4 w-24" />
        </div>
      </div>
      
      <div className="space-y-4">
        <SkeletonLoader className="h-4 w-1/4" />
        <SkeletonLoader className="h-10 w-full rounded-lg" />
        <SkeletonLoader className="h-4 w-1/4" />
        <SkeletonLoader className="h-10 w-full rounded-lg" />
        <SkeletonLoader className="h-4 w-1/4" />
        <SkeletonLoader className="h-10 w-full rounded-lg" />
      </div>
    </div>
  )
}
