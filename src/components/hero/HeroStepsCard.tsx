"use client";
import Link from "next/link";
import { BookOpen, ListChecks, Wallet, CheckCircle2 } from "lucide-react";
import { useState } from "react";

type Step = {
  n: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  href?: string;
  external?: boolean;
  disabled?: boolean;
  color: 'yellow' | 'blue';
};

const steps: Step[] = [
  { 
    n: 1, 
    icon: Wallet, 
    title: 'Обери план', 
    text: 'Mini або Maxi - залежно від кількості книг', 
    href: "/subscribe", 
    color: 'yellow' 
  },
  { 
    n: 2, 
    icon: BookOpen, 
    title: 'Знайди книги', 
    text: 'У каталозі понад 1000 цікавих видань', 
    href: "/books#catalog-top", 
    color: 'blue' 
  },
  { 
    n: 3, 
    icon: ListChecks, 
    title: 'Заповни заявку', 
    text: 'Швидка форма займе 1-2 хвилини', 
    href: "#subscribe", 
    color: 'yellow' 
  },
  { 
    n: 4, 
    icon: CheckCircle2, 
    title: 'Забери книги', 
    text: 'У зручній точці видачі в центрі міста', 
    href: "#pickup-location", 
    disabled: false,
    color: 'blue' 
  },
];

export default function HeroStepsCard() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <aside className="card relative mx-auto max-w-md md:ml-0 md:max-w-none lg:ml-auto lg:max-w-md xl:mr-[-1.2rem] 2xl:mr-[0.3rem]">
      {/* Заголовок с ценами */}
      <div className="text-center border-b border-gray-100 p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          Як почати читати
        </h3>
        <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 border border-yellow-200 px-4 py-2 text-sm font-medium text-yellow-800">
          <Wallet className="size-4" />
          <span>Mini 300₴ • Maxi 500₴</span>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="p-4 sm:p-6">
        <div className="space-y-1">
          {steps.map((step) => {
            const Icon = step.icon;
            const isHovered = hoveredStep === step.n;
            const isDisabled = step.disabled;
            
            const content = (
              <div className="relative">
                
                <div
                  className={`group relative flex items-start gap-3 p-3 rounded-xl transition-all duration-300 ${
                    isDisabled 
                      ? "opacity-60 cursor-not-allowed" 
                      : `cursor-pointer ${
                          isHovered
                            ? step.color === 'yellow'
                              ? 'bg-yellow-50 shadow-md scale-[1.02]'
                              : 'bg-blue-50 shadow-md scale-[1.02]'
                            : 'hover:bg-gray-50 hover:shadow-sm'
                        }`
                  }`}
                  onMouseEnter={() => !isDisabled && setHoveredStep(step.n)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  {/* Иконка с анимацией */}
                  <div className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 group-hover:scale-105 ${
                    isDisabled
                      ? 'bg-gray-200'
                      : isHovered
                      ? step.color === 'yellow'
                        ? 'bg-brand-yellow shadow-md'
                        : 'bg-brand-accent shadow-md'
                      : 'bg-gray-900 group-hover:bg-gray-800'
                  }`}>
                    <Icon className={`size-6 transition-all duration-300 ${
                      isDisabled
                        ? 'text-gray-400'
                        : isHovered
                        ? step.color === 'yellow'
                          ? 'text-gray-900'
                          : 'text-white'
                        : 'text-white'
                    }`} />
                    
                    {/* Пульсирующее кольцо при hover */}
                    {isHovered && !isDisabled && (
                      <div className={`absolute inset-0 rounded-xl animate-ping ${
                        step.color === 'yellow' ? 'bg-brand-yellow-light' : 'bg-blue-400'
                      } opacity-30`} />
                    )}
                  </div>

                  {/* Контент */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-start gap-2 mb-1">
                      <div className="flex-1">
                        <h4 className="text-base font-bold text-gray-900 leading-tight mb-1">
                          {step.title}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {step.text}
                        </p>
                      </div>
                    </div>
                    
                    {/* Подсказка для последнего шага */}
                    {isDisabled && (
                      <p className="text-xs text-gray-500 mt-2 ml-8">
                        Після оформлення заявки
                      </p>
                    )}
                  </div>
                </div>

              </div>
            );

            if (isDisabled || !step.href) {
              return (
                <div key={step.n}>
                  {content}
                </div>
              );
            }

            const isAnchor = step.href.startsWith("#");
            return (
              <div key={step.n}>
                {isAnchor ? (
                  <a href={step.href} className="block">
                    {content}
                  </a>
                ) : (
                  <Link href={step.href} className="block">
                    {content}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Дополнительная информация внизу */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Швидко • Зручно • Без зобов&apos;язань
          </p>
        </div>
      </div>
    </aside>
  );
}
