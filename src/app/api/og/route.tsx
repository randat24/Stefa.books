import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'Stefa.books'
    const description = searchParams.get('description') || 'Дитяча бібліотека книг з підпискою та орендою'
    const type = searchParams.get('type') || 'default'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fef3c7',
            backgroundImage: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(251, 191, 36, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)',
            }}
          />
          
          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              textAlign: 'center',
              maxWidth: '1000px',
            }}
          >
            {/* Logo/Icon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '120px',
                height: '120px',
                backgroundColor: '#f59e0b',
                borderRadius: '50%',
                marginBottom: '40px',
                boxShadow: '0 20px 40px rgba(245, 158, 11, 0.3)',
              }}
            >
              <div
                style={{
                  fontSize: '60px',
                  color: 'white',
                }}
              >
                📚
              </div>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: type === 'book' ? '48px' : '56px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '20px',
                lineHeight: 1.2,
                textAlign: 'center',
                maxWidth: '900px',
              }}
            >
              {title}
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: '28px',
                color: '#6b7280',
                marginBottom: '40px',
                lineHeight: 1.4,
                textAlign: 'center',
                maxWidth: '800px',
              }}
            >
              {description}
            </div>

            {/* Brand */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '24px',
                color: '#f59e0b',
                fontWeight: '600',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#f59e0b',
                  borderRadius: '50%',
                }}
              />
              Stefa.books
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#f59e0b',
                  borderRadius: '50%',
                }}
              />
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
