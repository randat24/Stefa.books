'use client'

import { useState, useEffect } from 'react'

export interface ABTestConfig<T> {
  testName: string
  variants: T[]
  trafficSplit?: number[] // Розподіл трафіку (default: рівний)
  duration?: number // Тривалість тесту в днях
  userIdGenerator?: () => string
}

export interface ABTestResult<T> {
  variant: T
  variantIndex: number
  isTestActive: boolean
}

/**
 * Hook для A/B тестування конверсійних елементів
 *
 * @example
 * const { variant } = useABTest({
 *   testName: 'hero-cta-button',
 *   variants: [
 *     { text: 'Спробувати безкоштовно', color: 'blue' },
 *     { text: 'Почати читати', color: 'green' },
 *     { text: 'Оформити підписку', color: 'red' }
 *   ]
 * })
 */
export function useABTest<T>({
  testName,
  variants,
  trafficSplit,
  duration = 30,
  userIdGenerator = () => Math.random().toString(36).substr(2, 9)
}: ABTestConfig<T>): ABTestResult<T> {
  const [result, setResult] = useState<ABTestResult<T>>({
    variant: variants[0],
    variantIndex: 0,
    isTestActive: false
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Перевіряємо, чи активний тест
    const testData = localStorage.getItem(`ab-test-${testName}`)
    const now = Date.now()

    let userId: string
    let selectedVariant: number
    let testStartTime: number

    if (testData) {
      const parsed = JSON.parse(testData)
      userId = parsed.userId
      selectedVariant = parsed.variantIndex
      testStartTime = parsed.startTime

      // Перевіряємо, чи не закінчився тест
      const testDurationMs = duration * 24 * 60 * 60 * 1000
      if (now - testStartTime > testDurationMs) {
        // Тест закінчився, очищаємо дані
        localStorage.removeItem(`ab-test-${testName}`)
        setResult({
          variant: variants[0],
          variantIndex: 0,
          isTestActive: false
        })
        return
      }
    } else {
      // Новий користувач, присвоюємо варіант
      userId = userIdGenerator()
      selectedVariant = selectVariant(userId, variants.length, trafficSplit)
      testStartTime = now

      // Зберігаємо дані тесту
      localStorage.setItem(`ab-test-${testName}`, JSON.stringify({
        userId,
        variantIndex: selectedVariant,
        startTime: testStartTime,
        testName
      }))

      // Відправляємо подію початку тесту
      trackABTestEvent('ab_test_start', {
        test_name: testName,
        variant_index: selectedVariant,
        user_id: userId
      })
    }

    setResult({
      variant: variants[selectedVariant],
      variantIndex: selectedVariant,
      isTestActive: true
    })

  }, [testName, variants, trafficSplit, duration, userIdGenerator])

  return result
}

/**
 * Вибирає варіант на основі user ID та налаштувань трафіку
 */
function selectVariant(
  userId: string,
  variantCount: number,
  trafficSplit?: number[]
): number {
  // Генеруємо консистентне число від 0 до 1 на основі userId
  const hash = Array.from(userId).reduce((acc, char) => {
    return (acc << 5) - acc + char.charCodeAt(0)
  }, 0)
  const normalizedHash = Math.abs(hash) / 2147483647

  if (trafficSplit && trafficSplit.length === variantCount) {
    // Використовуємо кастомний розподіл трафіку
    const totalSplit = trafficSplit.reduce((sum, split) => sum + split, 0)
    let cumulative = 0

    for (let i = 0; i < trafficSplit.length; i++) {
      cumulative += trafficSplit[i] / totalSplit
      if (normalizedHash <= cumulative) {
        return i
      }
    }
  }

  // Рівний розподіл трафіку
  return Math.floor(normalizedHash * variantCount)
}

/**
 * Відстежує події A/B тестування
 */
function trackABTestEvent(eventName: string, properties: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties)
  }

  // Можна додати інші системи аналітики
  console.log(`AB Test Event: ${eventName}`, properties)
}

/**
 * Hook для відстеження конверсій A/B тестів
 */
export function useABTestConversion(testName: string) {
  const trackConversion = (conversionType: string = 'conversion') => {
    if (typeof window === 'undefined') return

    const testData = localStorage.getItem(`ab-test-${testName}`)
    if (!testData) return

    const { userId, variantIndex } = JSON.parse(testData)

    trackABTestEvent('ab_test_conversion', {
      test_name: testName,
      variant_index: variantIndex,
      user_id: userId,
      conversion_type: conversionType
    })
  }

  return { trackConversion }
}

/**
 * Hook для отримання результатів A/B тестів (для адміністраторів)
 */
export function useABTestResults(testName: string) {
  const [results, setResults] = useState(null)

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/ab-tests/${testName}/results`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Помилка завантаження результатів A/B тесту:', error)
    }
  }

  useEffect(() => {
    fetchResults()
  }, [testName])

  return { results, refetch: fetchResults }
}