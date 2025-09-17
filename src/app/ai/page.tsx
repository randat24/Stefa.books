'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  Send, 
  BookOpen, 
  Lightbulb,
  MessageCircle,
  Sparkles,
  Clock,
  User
} from 'lucide-react'
import { logger } from '@/lib/logger'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  suggestions?: string[]
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Привет! Я AI-помощник Stefa.Books. Могу помочь вам выбрать книги, ответить на вопросы о подписке или дать рекомендации по чтению. Что вас интересует?',
      timestamp: new Date(),
      suggestions: [
        'Рекомендуйте книги для детей 3-6 лет',
        'Как работает подписка?',
        'Какие книги самые популярные?',
        'Как арендовать книгу?'
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Имитация ответа AI
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const aiResponse = generateAIResponse(inputValue)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      logger.error('Ошибка AI помощника:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Извините, произошла ошибка. Попробуйте еще раз.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIResponse = (userInput: string) => {
    const input = userInput.toLowerCase()
    
    if (input.includes('рекоменд') || input.includes('книг')) {
      return {
        content: 'Отличный выбор! Для детей 3-6 лет рекомендую:\n\n📚 **Классические сказки**: "Колобок", "Репка", "Теремок"\n📚 **Развивающие книги**: "Азбука", "Счет до 10"\n📚 **Современные авторы**: книги украинских писателей\n\nХотите посмотреть конкретные книги в каталоге?',
        suggestions: [
          'Показать каталог книг',
          'Книги для детей 6-12 лет',
          'Как выбрать подходящую книгу?'
        ]
      }
    }
    
    if (input.includes('подписк')) {
      return {
        content: 'У нас есть три тарифных плана подписки:\n\n🟢 **Mini** (300 ₴/мес) - 1 книга одновременно\n🟡 **Maxi** (500 ₴/мес) - 2 книги одновременно\n🟠 **Premium** (1500 ₴/мес) - 3 книги одновременно\n\nПодписка включает доставку и возврат книг. Хотите оформить подписку?',
        suggestions: [
          'Оформить подписку',
          'Как работает доставка?',
          'Можно ли изменить тариф?'
        ]
      }
    }
    
    if (input.includes('аренд') || input.includes('взять')) {
      return {
        content: 'Для аренды книги:\n\n1️⃣ Выберите книгу в каталоге\n2️⃣ Нажмите "Арендовать"\n3️⃣ Заполните форму заявки\n4️⃣ Дождитесь подтверждения\n5️⃣ Получите книгу\n\nКниги можно арендовать на день, неделю или месяц.',
        suggestions: [
          'Открыть каталог',
          'Как рассчитать стоимость?',
          'Когда нужно вернуть книгу?'
        ]
      }
    }
    
    if (input.includes('популярн') || input.includes('лучш')) {
      return {
        content: 'Самые популярные книги у наших читателей:\n\n⭐ "Колобок" - классика для малышей\n⭐ "Азбука" - обучение буквам\n⭐ "Сказки Андерсена" - для детей постарше\n⭐ "Приключения Незнайки" - веселые истории\n\nВсе эти книги доступны в нашем каталоге!',
        suggestions: [
          'Показать все популярные книги',
          'Книги по возрасту',
          'Новинки каталога'
        ]
      }
    }
    
    return {
      content: 'Я понимаю ваш вопрос! К сожалению, я пока не могу дать точный ответ на этот вопрос. Но я могу помочь вам:\n\n• Выбрать подходящие книги\n• Объяснить, как работает подписка\n• Показать каталог\n• Ответить на вопросы о сервисе\n\nПопробуйте задать вопрос по-другому!',
      suggestions: [
        'Показать каталог книг',
        'Как работает подписка?',
        'Связаться с поддержкой'
      ]
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('uk-UA', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Bot className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Помощник</h1>
          <p className="text-gray-600">Задайте любой вопрос о книгах и подписке</p>
        </div>

        {/* Chat Container */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Чат с AI-помощником
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-3' : 'mr-3'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' 
                          ? 'bg-blue-600' 
                          : 'bg-gray-200'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                      
                      {/* Timestamp */}
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTime(message.timestamp)}
                      </div>

                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs"
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Bot className="h-4 w-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Задайте вопрос о книгах или подписке..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold">Каталог книг</h3>
                <p className="text-sm text-gray-600">Посмотрите все доступные книги</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-yellow-600" />
              <div>
                <h3 className="font-semibold">Рекомендации</h3>
                <p className="text-sm text-gray-600">Получите персональные советы</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold">Подписка</h3>
                <p className="text-sm text-gray-600">Узнайте о тарифных планах</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
