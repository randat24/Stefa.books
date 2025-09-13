'use client';

import { useState } from 'react';
import { BookOpen, FileText, CreditCard } from 'lucide-react';

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
      color: 'yellow',
      isPrimary: true
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
      description: 'Оплатіть підписку та заберіть книги у точці видачі: вул. Маріупольська 13/2, Миколаїв.',
      action: 'Дізнатися про плани →',
      targetId: 'plans',
      color: 'yellow',
      isPrimary: true
    }
  ];

  return (
    <section className="section" aria-labelledby="steps-title">
      <div className="container">
        <header className="text-center mb-16">
          <h2 id="steps-title" className="text-h1 text-neutral-900 mb-4">
            Як оформити підписку на дитячі книги за 3 кроки
          </h2>
          <p className="text-body-lg text-neutral-600 max-w-2xl mx-auto">
            Швидко та зручно отримайте доступ до великої бібліотеки українських дитячих книг. Простий процес оформлення підписки на книжкову оренду в Миколаєві.
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
                <article
                  className={`group relative flex items-start gap-6 p-6 rounded-[var(--radius-xl)] transition-all duration-300 cursor-pointer ${
                    isHovered
                      ? 'bg-[var(--brand)]/10 shadow-lg scale-[1.02]'
                      : 'hover:bg-[var(--surface-2)] hover:shadow-md'
                  }`}
                  onMouseEnter={() => setHoveredStep(step.id)}
                  onMouseLeave={() => setHoveredStep(null)}
                  onClick={() => scrollToId(step.targetId)}
                >
                  {/* Номер с анимацией */}
                  <div className={`relative flex items-center justify-center w-16 h-16 rounded-[var(--radius-lg)] h3 transition-all duration-300 group-hover:scale-110 ${
                    isHovered
                      ? 'bg-[var(--brand)] text-[var(--accent)] shadow-lg'
                      : 'bg-[var(--surface-2)] text-[var(--text-muted)] group-hover:bg-[var(--surface)]'
                  }`}>
                    {step.id}
                    
                    {/* Пульсирующее кольцо при hover */}
                    {isHovered && (
                      <div className="absolute inset-0 rounded-[var(--radius-lg)] animate-ping bg-[var(--brand)]/30" />
                    )}
                  </div>

                  {/* Контент */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Иконка */}
                      <div className={`p-3 rounded-[var(--radius-md)] transition-all duration-300 ${
                        isHovered
                          ? 'bg-[var(--brand)]/20 scale-110'
                          : 'bg-[var(--surface-2)] group-hover:bg-[var(--surface)]'
                      }`}>
                        <Icon className={`h-6 w-6 transition-all duration-300 ${
                          isHovered
                            ? 'text-[var(--accent)]'
                            : 'text-[var(--text-muted)] group-hover:text-[var(--text)]'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="h2 mb-2 leading-tight">
                          {step.title}
                        </h3>
                        <p className="lead leading-relaxed mb-4 max-w-lg">
                          {step.description}
                        </p>
                        
                        {/* Кнопка действия */}
                        <button
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            scrollToId(step.targetId);
                          }}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 hover:scale-[1.03] ${
                            step.isPrimary
                              ? 'bg-[var(--brand)] text-[var(--accent)] hover:bg-[var(--brand)]/90 shadow-sm'
                              : 'border border-[var(--line)] text-[var(--text)] hover:bg-[var(--surface)]'
                          }`}
                        >
                          {step.action}
                        </button>
                      </div>
                    </div>
                  </div>
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