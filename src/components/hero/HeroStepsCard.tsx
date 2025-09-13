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
      <div className="text-center border-b border-[var(--line)] p-3">
        <h3 className="text-xl font-semibold mb-2">
          Як почати читати
        </h3>
        <div className="inline-flex items-center gap-2 rounded-full bg-[#FFFBEB] border border-[#FCD34D] px-4 py-2 text-sm font-medium text-[#D97706]">
          <Wallet className="size-3 text-[#D97706]" />
          <span>Mini 300₴ • Maxi 500₴</span>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="p-3">
        <div className="space-y-0.5">
          {steps.map((step) => {
            const Icon = step.icon;
            const isHovered = hoveredStep === step.n;
            const isDisabled = step.disabled;
            
            const content = (
              <div className="relative">
                <div
                  className={`group relative flex items-start gap-2.5 p-2.5 rounded-[var(--radius-lg)] transition-all duration-300 ${
                    isDisabled 
                      ? "opacity-60 cursor-not-allowed" 
                      : `cursor-pointer ${
                          isHovered
                            ? 'bg-[var(--brand)]/10 shadow-md scale-[1.02]'
                            : 'hover:bg-[var(--surface-2)] hover:shadow-sm'
                        }`
                  }`}
                  onMouseEnter={() => !isDisabled && setHoveredStep(step.n)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  {/* Иконка с анимацией */}
                  <div className={`relative flex items-center justify-center w-10 h-10 rounded-[var(--radius-lg)] transition-all duration-300 group-hover:scale-105 ${
                    isDisabled
                      ? 'bg-[var(--line)]'
                      : isHovered
                      ? 'bg-[var(--brand)] shadow-md'
                      : 'bg-[var(--accent)] group-hover:bg-[var(--accent-700)]'
                  }`}>
                    <Icon className={`size-5 transition-all duration-300 ${
                      isDisabled
                        ? 'text-[var(--text-muted)]'
                        : isHovered
                        ? 'text-[var(--accent)]'
                        : 'text-[var(--surface)]'
                    }`} />
                    
                    {/* Пульсирующее кольцо при hover */}
                    {isHovered && !isDisabled && (
                      <div className="absolute inset-0 rounded-[var(--radius-lg)] animate-ping bg-[var(--brand)] opacity-30" />
                    )}
                  </div>

                  {/* Контент */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start gap-2 mb-0.5">
                      <div className="flex-1">
                        <h4 className="text-base font-semibold leading-tight mb-0.5">
                          {step.title}
                        </h4>
                        <p className="text-sm text-[var(--text)] leading-relaxed">
                          {step.text}
                        </p>
                      </div>
                    </div>
                    
                    {/* Подсказка для последнего шага */}
                    {isDisabled && (
                      <p className="tiny text-[var(--text)] mt-2 ml-8">
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
        <div className="mt-4 pt-3 border-t border-[var(--line)] text-center">
          <p className="text-xs text-[var(--text)]">
            Швидко • Зручно • Дуже легко
          </p>
        </div>
      </div>
    </aside>
  );
}