import { NextRequest, NextResponse } from 'next/server'

// Типи для результатів A/B тестів
interface ABTestStats {
  variant_index: number
  impressions: number
  conversions: number
  conversion_rate: number
  confidence_level?: number
}

interface ABTestResults {
  test_name: string
  status: 'active' | 'completed' | 'paused'
  start_date: string
  end_date?: string
  total_participants: number
  variants: ABTestStats[]
  winner?: number
  statistical_significance?: boolean
}

/**
 * API для отримання результатів A/B тестів
 * GET /api/ab-tests/[testName]/results
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { testName: string } }
) {
  try {
    const { testName } = params

    // В реальному проекті тут буде запит до бази даних
    // Наразі повертаємо демо-дані
    const mockResults: ABTestResults = generateMockResults(testName)

    return NextResponse.json(mockResults)

  } catch (error) {
    console.error('Помилка отримання результатів A/B тесту:', error)
    return NextResponse.json(
      { error: 'Не вдалося отримати результати тесту' },
      { status: 500 }
    )
  }
}

/**
 * API для записи події A/B тесту
 * POST /api/ab-tests/[testName]/results
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { testName: string } }
) {
  try {
    const { testName } = params
    const body = await request.json()

    const {
      event_type, // 'impression' | 'conversion'
      variant_index,
      user_id,
      conversion_type = 'default',
      timestamp = new Date().toISOString()
    } = body

    // Валідація
    if (!event_type || variant_index === undefined || !user_id) {
      return NextResponse.json(
        { error: 'Відсутні обов\'язкові поля' },
        { status: 400 }
      )
    }

    // В реальному проекті тут буде запис до бази даних
    // Наприклад, в Supabase таблицю ab_test_events

    /*
    const { error } = await supabase
      .from('ab_test_events')
      .insert({
        test_name: testName,
        event_type,
        variant_index,
        user_id,
        conversion_type,
        timestamp,
        user_agent: request.headers.get('user-agent'),
        ip_address: request.ip || request.headers.get('x-forwarded-for')
      })

    if (error) throw error
    */

    console.log('A/B Test Event recorded:', {
      testName,
      event_type,
      variant_index,
      user_id,
      conversion_type
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Помилка запису події A/B тесту:', error)
    return NextResponse.json(
      { error: 'Не вдалося записати подію' },
      { status: 500 }
    )
  }
}

/**
 * Генерує демо-дані для результатів тестів
 */
function generateMockResults(testName: string): ABTestResults {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 15) // Тест почався 15 днів тому

  // Різні результати залежно від назви тесту
  switch (testName) {
    case 'hero-cta-button':
      return {
        test_name: testName,
        status: 'active',
        start_date: startDate.toISOString(),
        total_participants: 1247,
        variants: [
          {
            variant_index: 0,
            impressions: 415,
            conversions: 23,
            conversion_rate: 5.54,
            confidence_level: 95
          },
          {
            variant_index: 1,
            impressions: 408,
            conversions: 31,
            conversion_rate: 7.60,
            confidence_level: 95
          },
          {
            variant_index: 2,
            impressions: 424,
            conversions: 19,
            conversion_rate: 4.48,
            confidence_level: 95
          }
        ],
        winner: 1,
        statistical_significance: true
      }

    case 'pricing-display':
      return {
        test_name: testName,
        status: 'active',
        start_date: startDate.toISOString(),
        total_participants: 892,
        variants: [
          {
            variant_index: 0,
            impressions: 298,
            conversions: 18,
            conversion_rate: 6.04
          },
          {
            variant_index: 1,
            impressions: 294,
            conversions: 21,
            conversion_rate: 7.14
          },
          {
            variant_index: 2,
            impressions: 300,
            conversions: 24,
            conversion_rate: 8.00
          }
        ],
        winner: 2,
        statistical_significance: false // Ще недостатньо даних
      }

    default:
      return {
        test_name: testName,
        status: 'active',
        start_date: startDate.toISOString(),
        total_participants: 0,
        variants: [
          {
            variant_index: 0,
            impressions: 0,
            conversions: 0,
            conversion_rate: 0
          }
        ]
      }
  }
}