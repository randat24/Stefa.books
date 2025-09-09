'use client'

import { useState } from 'react'

export default function TestAIPage() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const testAI = async () => {
    setLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/claude/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testType: 'basic',
          testData: {
            prompt: message || 'Привіт! Протестуй безкоштовну AI модель.'
          }
        })
      })

      const data = await res.json()
      
      if (data.success) {
        setResponse(`✅ Модель працює!\n\n🤖 Відповідь: ${data.result.content}\n\n📊 Модель: ${data.performance.model}\n⏱ Час: ${data.performance.executionTimeMs}мс`)
      } else {
        setResponse(`❌ Помилка: ${data.error}`)
      }
    } catch (error) {
      setResponse(`❌ Помилка з'єднання: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          🤖 Тест безкоштовної AI моделі
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">💡 Інформація</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>✅ <strong>Без API ключів:</strong> Використовується симулована або Groq модель</p>
            <p>🚀 <strong>Моделі:</strong> Llama 3 70B, Mixtral, Gemma</p>
            <p>🆓 <strong>Безкоштовно:</strong> Повністю готово до роботи</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ваше повідомлення:
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Напишіть щось для AI..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={testAI}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {loading ? '🔄 Тестуємо...' : '🚀 Протестувати AI'}
          </button>

          {response && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium text-gray-900 mb-2">Результат:</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">{response}</pre>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🏠 <a href="/" className="text-blue-600 hover:underline">Повернутися на головну</a></p>
        </div>
      </div>
    </div>
  )
}