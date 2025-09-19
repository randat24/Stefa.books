'use client'

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h1>Щось пішло не так!</h1>
      <p>Виникла помилка при завантаженні сторінки.</p>
      {error?.message && <p className="text-sm text-gray-600">Помилка: {error.message}</p>}
      <button onClick={reset}>Спробувати знову</button>
    </div>
  )
}