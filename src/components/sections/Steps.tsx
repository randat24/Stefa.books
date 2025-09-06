'use client';

import { useState } from 'react';
import { BookOpen, FileText, CreditCard, ArrowDown } from 'lucide-react';

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
}

export default function Steps() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      icon: BookOpen,
      title: 'Обрати книгу з каталогу',
      description: 'Переглянь каталог і вибери те, що хочеться читати. Вибір з понад 1000 книг різних жанрів.',
      action: 'Перейти до каталогу →',
      targetId: 'catalog',
      color: 'blue',
      isPrimary: false
    },
    {
      id: 2,
      icon: FileText,
      title: 'Заповнити заявку на підписку',
      description: 'Коротка форма — 1–2 хвилини. Вкажи контакти та обраний план. Ми зв\'яжемося для підтвердження.',
      action: 'Заповнити форму',
      targetId: 'subscribe',
      color: 'yellow',
      isPrimary: true
    },
    {
      id: 3,
      icon: CreditCard,
      title: 'Оплатити та забрати книги',
      description: 'Оберіть зручний спосіб оплати. Заберіть книги у точці видачі або отримайте доставку.',
      action: 'Дізнатися про плани →',
      targetId: 'plans',
      color: 'blue',
      isPrimary: false
    }
  ];

  return (
    <section className="py-16 lg:py-24" aria-labelledby="steps-title">
      <div className="container">
        <header className="text-center mb-16">
          <h2 id="steps-title" className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
            Крок за кроком
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Простий процес оформлення підписки на книжкову оренду
          </p>
        </header>

        {/* Вертикальный timeline */}
        <div className="max-w-3xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isHovered = hoveredStep === step.id;
            const isNotLast = index < steps.length - 1;
            
            return (
              <div key={step.id} className="relative">
                {/* Соединительная линия */}
                {isNotLast && (
                  <div className="absolute left-8 top-20 w-0.5 h-16 bg-gradient-to-b from-gray-300 to-gray-200" />
                )}
                
                <article
                  className={`group relative flex items-start gap-6 p-6 rounded-2xl transition-all duration-300 cursor-pointer ${
                    isHovered
                      ? step.color === 'yellow'
                        ? 'bg-yellow-50 shadow-lg scale-[1.02]'
                        : 'bg-blue-50 shadow-lg scale-[1.02]'
                      : 'hover:bg-gray-50 hover:shadow-md'
                  }`}
                  onMouseEnter={() => setHoveredStep(step.id)}
                  onMouseLeave={() => setHoveredStep(null)}
                  onClick={() => scrollToId(step.targetId)}
                >
                  {/* Номер с анимацией */}
                  <div className={`relative flex items-center justify-center w-16 h-16 rounded-2xl text-xl font-bold transition-all duration-300 group-hover:scale-110 ${
                    isHovered
                      ? step.color === 'yellow'
                        ? 'bg-brand-yellow text-gray-900 shadow-lg'
                        : 'bg-brand-accent text-white shadow-lg'
                      : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
                  }`}>
                    {step.id}
                    
                    {/* Пульсирующее кольцо при hover */}
                    {isHovered && (
                      <div className={`absolute inset-0 rounded-2xl animate-ping ${
                        step.color === 'yellow' ? 'bg-brand-yellow-light' : 'bg-blue-400'
                      } opacity-30`} />
                    )}
                  </div>

                  {/* Контент */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Иконка */}
                      <div className={`p-3 rounded-xl transition-all duration-300 ${
                        isHovered
                          ? step.color === 'yellow'
                            ? 'bg-yellow-100 scale-110'
                            : 'bg-blue-100 scale-110'
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}>
                        <Icon className={`h-6 w-6 transition-all duration-300 ${
                          isHovered
                            ? step.color === 'yellow'
                              ? 'text-brand-yellow-dark'
                              : 'text-brand-accent-light'
                            : 'text-gray-500 group-hover:text-gray-600'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-gray-800">
                          {step.title}
                        </h3>
                        <p className="text-lg text-gray-600 leading-relaxed mb-4 max-w-lg">
                          {step.description}
                        </p>
                        
                        {/* Кнопка действия */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            scrollToId(step.targetId);
                          }}
                          className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105 ${
                            step.isPrimary
                              ? 'bg-brand-yellow text-gray-900 hover:bg-brand-yellow-light focus:ring-brand-yellow'
                              : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-500'
                          }`}
                        >
                          {step.action}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Стрелка вниз для направления */}
                  {isNotLast && (
                    <div className={`absolute -bottom-3 left-8 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isHovered ? 'bg-white shadow-lg' : 'bg-gray-100 group-hover:bg-white group-hover:shadow-md'
                    }`}>
                      <ArrowDown className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </article>

                {isNotLast && <div className="h-8" />}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}