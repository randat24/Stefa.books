"use client"

import { useState } from 'react'
import { 
  ButtonRipple, 
  CardHover, 
  IconHover, 
  TextUnderline,
  ModalAnimation,
  StaggeredItem,
  NotificationSlide,
  FormFieldAnimation,
  PulseAnimation,
  BookListSkeleton,
  FormSkeleton,
  TableSkeleton,
  ProfileSkeleton,
  Swipeable,
  PullToRefresh,
  DoubleTap,
  LongPress
} from '@/components/animations'
import { EnhancedForm } from '@/components/forms/EnhancedForm'
import { LoadingStates } from '@/components/ui/LoadingStates'
import { 
  Heart, 
  Star, 
  BookOpen, 
  User, 
  Settings, 
  Bell,
  RefreshCw,
  Zap,
  Sparkles
} from 'lucide-react'

export default function AnimationsDemoPage() {
  const [showModal, setShowModal] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)

  const handleRefresh = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setRefreshCount(prev => prev + 1)
    setIsLoading(false)
  }

  const handleDoubleTap = () => {
    alert('Двойной тап!')
  }

  const handleLongPress = () => {
    alert('Долгое нажатие!')
  }

  const formFields = [
    {
      name: 'name',
      label: 'Ім\'я',
      type: 'text' as const,
      required: true,
      validation: (value: string) => value.length < 2 ? 'Ім\'я повинно містити мінімум 2 символи' : null
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email' as const,
      required: true,
      validation: (value: string) => !value.includes('@') ? 'Введіть коректний email' : null
    },
    {
      name: 'message',
      label: 'Повідомлення',
      type: 'textarea' as const,
      required: false
    },
    {
      name: 'subscribe',
      label: 'Підписатися на оновлення',
      type: 'checkbox' as const,
      required: false
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Демонстрація анімацій
          </h1>
          <p className="text-lg text-gray-600">
            Спринт 5: Покращення UX та анімацій
          </p>
        </div>

        {/* Микро-анимации */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Микро-анимации</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Кнопки с ripple эффектом */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Кнопки з Ripple</h3>
              <div className="space-y-3">
                <ButtonRipple>
                  <button className="px-6 py-3 bg-brand-yellow text-brand rounded-lg font-medium hover:bg-brand-yellow-light transition-colors">
                    Кнопка з Ripple
                  </button>
                </ButtonRipple>
                <ButtonRipple>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Інша кнопка
                  </button>
                </ButtonRipple>
              </div>
            </div>

            {/* Карточки с hover */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Карточки з Hover</h3>
              <div className="space-y-3">
                <CardHover>
                  <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                    <h4 className="font-semibold text-gray-900">Карточка 1</h4>
                    <p className="text-gray-600 mt-2">Наведіть курсор для анімації</p>
                  </div>
                </CardHover>
                <CardHover>
                  <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                    <h4 className="font-semibold text-gray-900">Карточка 2</h4>
                    <p className="text-gray-600 mt-2">Спробуйте натиснути</p>
                  </div>
                </CardHover>
              </div>
            </div>

            {/* Иконки с hover */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Іконки з Hover</h3>
              <div className="flex space-x-4">
                <IconHover>
                  <button className="p-3 bg-white rounded-full shadow-md hover:bg-gray-50">
                    <Heart className="h-6 w-6 text-red-500" />
                  </button>
                </IconHover>
                <IconHover>
                  <button className="p-3 bg-white rounded-full shadow-md hover:bg-gray-50">
                    <Star className="h-6 w-6 text-yellow-500" />
                  </button>
                </IconHover>
                <IconHover>
                  <button className="p-3 bg-white rounded-full shadow-md hover:bg-gray-50">
                    <BookOpen className="h-6 w-6 text-blue-500" />
                  </button>
                </IconHover>
              </div>
            </div>
          </div>
        </section>

        {/* Текст с подчеркиванием */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Текст з підкресленням</h2>
          <div className="flex space-x-8">
            <TextUnderline>
              <a href="#" className="text-lg font-medium text-gray-700 hover:text-gray-900">
                Головна
              </a>
            </TextUnderline>
            <TextUnderline>
              <a href="#" className="text-lg font-medium text-gray-700 hover:text-gray-900">
                Каталог
              </a>
            </TextUnderline>
            <TextUnderline>
              <a href="#" className="text-lg font-medium text-gray-700 hover:text-gray-900">
                Про нас
              </a>
            </TextUnderline>
          </div>
        </section>

        {/* Модальные окна */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Модальні вікна</h2>
          <ButtonRipple>
            <button 
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Відкрити модальне вікно
            </button>
          </ButtonRipple>

          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <ModalAnimation className="bg-white rounded-xl p-8 max-w-md mx-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Модальне вікно</h3>
                <p className="text-gray-600 mb-6">
                  Це демонстрація анімованого модального вікна з плавним появленням.
                </p>
                <ButtonRipple>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Закрити
                  </button>
                </ButtonRipple>
              </ModalAnimation>
            </div>
          )}
        </section>

        {/* Staggered список */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Staggered список</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <StaggeredItem key={index} index={index}>
                <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                  <h4 className="font-semibold text-gray-900">Елемент {index + 1}</h4>
                  <p className="text-gray-600 mt-2">Появляється з затримкою</p>
                </div>
              </StaggeredItem>
            ))}
          </div>
        </section>

        {/* Уведомления */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Сповіщення</h2>
          <div className="space-y-4">
            <ButtonRipple>
              <button 
                onClick={() => setShowNotification(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Показати сповіщення
              </button>
            </ButtonRipple>

            {showNotification && (
              <NotificationSlide className="max-w-md">
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-3" />
                    <span>Успішне сповіщення!</span>
                  </div>
                </div>
              </NotificationSlide>
            )}
          </div>
        </section>

        {/* Скелетоны загрузки */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Скелетони завантаження</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Список книг</h3>
              <BookListSkeleton count={4} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Форма</h3>
              <FormSkeleton />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Таблиця</h3>
              <TableSkeleton rows={3} columns={4} />
            </div>
          </div>
        </section>

        {/* Улучшенная форма */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Покращена форма</h2>
          <div className="max-w-2xl">
            <EnhancedForm
              fields={formFields}
              onSubmit={async (data) => {
                console.log('Form data:', data)
                await new Promise(resolve => setTimeout(resolve, 1000))
              }}
              submitText="Відправити форму"
              showProgress={true}
            />
          </div>
        </section>

        {/* Мобильные жесты */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Мобільні жести</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Swipe жести</h3>
              <Swipeable
                onSwipeLeft={() => alert('Swipe вліво!')}
                onSwipeRight={() => alert('Swipe вправо!')}
                onSwipeUp={() => alert('Swipe вгору!')}
                onSwipeDown={() => alert('Swipe вниз!')}
              >
                <div className="p-8 bg-white rounded-xl shadow-md border border-gray-200 text-center">
                  <p className="text-gray-600">Потягніть в будь-якому напрямку</p>
                </div>
              </Swipeable>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Pull to Refresh</h3>
              <PullToRefresh onRefresh={handleRefresh}>
                <div className="p-8 bg-white rounded-xl shadow-md border border-gray-200 text-center">
                  <p className="text-gray-600">Потягніть вгору для оновлення</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Оновлень: {refreshCount}
                  </p>
                </div>
              </PullToRefresh>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Двойной тап</h3>
              <DoubleTap onDoubleTap={handleDoubleTap}>
                <div className="p-8 bg-white rounded-xl shadow-md border border-gray-200 text-center">
                  <p className="text-gray-600">Двічі натисніть</p>
                </div>
              </DoubleTap>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Долгое нажатие</h3>
              <LongPress onLongPress={handleLongPress}>
                <div className="p-8 bg-white rounded-xl shadow-md border border-gray-200 text-center">
                  <p className="text-gray-600">Тримайте натиснутим</p>
                </div>
              </LongPress>
            </div>
          </div>
        </section>

        {/* Условная загрузка */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Умовне завантаження</h2>
          <div className="space-y-4">
            <ButtonRipple>
              <button 
                onClick={() => setIsLoading(!isLoading)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                {isLoading ? 'Приховати' : 'Показати'} завантаження
              </button>
            </ButtonRipple>

            <LoadingStates 
              type="book-list" 
              count={3}
              className={isLoading ? 'block' : 'hidden'}
            />
          </div>
        </section>

        {/* Пульсация */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Пульсація</h2>
          <div className="flex space-x-8">
            <PulseAnimation>
              <div className="p-6 bg-yellow-100 rounded-xl">
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
            </PulseAnimation>
            <PulseAnimation>
              <div className="p-6 bg-blue-100 rounded-xl">
                <RefreshCw className="h-8 w-8 text-blue-600" />
              </div>
            </PulseAnimation>
            <PulseAnimation>
              <div className="p-6 bg-green-100 rounded-xl">
                <Sparkles className="h-8 w-8 text-green-600" />
              </div>
            </PulseAnimation>
          </div>
        </section>
      </div>
    </div>
  )
}
