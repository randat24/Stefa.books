'use client'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4">Помилка</h1>
        <p className="text-lg mb-4">Щось пішло не так!</p>
        <p className="text-gray-600 mb-8">Виникла помилка при завантаженні сторінки.</p>
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Спробувати знову
        </button>
      </div>
    </div>
  )
}