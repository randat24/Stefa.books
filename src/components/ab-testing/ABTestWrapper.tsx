'use client'

import { useABTest, useABTestConversion } from '@/lib/hooks/useABTest'
import { ReactNode } from 'react'

interface ABTestWrapperProps<T> {
  testName: string
  variants: T[]
  trafficSplit?: number[]
  duration?: number
  children: (variant: T, trackConversion: (type?: string) => void) => ReactNode
  fallback?: ReactNode
}

/**
 * Обгортка для A/B тестування будь-яких компонентів
 *
 * @example
 * <ABTestWrapper
 *   testName="hero-cta-text"
 *   variants={[
 *     { text: 'Спробувати безкоштовно', style: 'primary' },
 *     { text: 'Почати читати зараз', style: 'secondary' },
 *     { text: 'Оформити підписку', style: 'accent' }
 *   ]}
 *   duration={30}
 * >
 *   {(variant, trackConversion) => (
 *     <Button
 *       className={variant.style}
 *       onClick={() => trackConversion('cta_click')}
 *     >
 *       {variant.text}
 *     </Button>
 *   )}
 * </ABTestWrapper>
 */
export function ABTestWrapper<T>({
  testName,
  variants,
  trafficSplit,
  duration = 30,
  children,
  fallback
}: ABTestWrapperProps<T>) {
  const { variant, isTestActive } = useABTest({
    testName,
    variants,
    trafficSplit,
    duration
  })

  const { trackConversion } = useABTestConversion(testName)

  if (!isTestActive && fallback) {
    return <>{fallback}</>
  }

  return <>{children(variant, trackConversion)}</>
}

// Спеціалізовані компоненти для типових A/B тестів

interface CTAButtonVariant {
  text: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'accent'
}

interface CTAButtonTestProps {
  testName: string
  variants: CTAButtonVariant[]
  onClick?: () => void
  className?: string
  children?: ReactNode
}

/**
 * Готовий компонент для A/B тестування CTA кнопок
 */
export function CTAButtonTest({
  testName,
  variants,
  onClick,
  className,
  children
}: CTAButtonTestProps) {
  return (
    <ABTestWrapper testName={testName} variants={variants}>
      {(variant, trackConversion) => (
        <button
          className={`
            px-6 py-3 rounded-lg font-semibold transition-all duration-200
            ${variant.variant === 'primary' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
            ${variant.variant === 'secondary' ? 'bg-gray-200 hover:bg-gray-300 text-gray-800' : ''}
            ${variant.variant === 'accent' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
            ${variant.size === 'sm' ? 'px-4 py-2 text-sm' : ''}
            ${variant.size === 'lg' ? 'px-8 py-4 text-lg' : ''}
            ${variant.className || ''}
            ${className || ''}
          `}
          onClick={() => {
            trackConversion('button_click')
            onClick?.()
          }}
        >
          {variant.text}
          {children}
        </button>
      )}
    </ABTestWrapper>
  )
}

interface HeroTextVariant {
  headline: string
  subheadline: string
  highlight?: string
}

interface HeroTextTestProps {
  testName: string
  variants: HeroTextVariant[]
  className?: string
}

/**
 * Готовий компонент для A/B тестування Hero секцій
 */
export function HeroTextTest({
  testName,
  variants,
  className
}: HeroTextTestProps) {
  return (
    <ABTestWrapper testName={testName} variants={variants}>
      {(variant) => (
        <div className={`text-center ${className || ''}`}>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {variant.highlight ? (
              <>
                {variant.headline.split(variant.highlight)[0]}
                <span className="text-blue-600">{variant.highlight}</span>
                {variant.headline.split(variant.highlight)[1]}
              </>
            ) : (
              variant.headline
            )}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {variant.subheadline}
          </p>
        </div>
      )}
    </ABTestWrapper>
  )
}

interface PricingVariant {
  currency: string
  period: string
  emphasize?: boolean
}

interface PricingTestProps {
  testName: string
  variants: PricingVariant[]
  price: number
  className?: string
}

/**
 * Готовий компонент для A/B тестування відображення цін
 */
export function PricingTest({
  testName,
  variants,
  price,
  className
}: PricingTestProps) {
  return (
    <ABTestWrapper testName={testName} variants={variants}>
      {(variant) => (
        <div className={`${className || ''}`}>
          <span className={`
            text-3xl font-bold
            ${variant.emphasize ? 'text-green-600' : 'text-gray-900'}
          `}>
            {price} {variant.currency}
          </span>
          <span className="text-gray-600 ml-2">
            {variant.period}
          </span>
        </div>
      )}
    </ABTestWrapper>
  )
}