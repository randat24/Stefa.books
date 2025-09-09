"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { logger } from "@/lib/logger"; 

type FormData = {
  name: string;
  phone: string;
  email: string;
  social: string;
  subscription_type: "mini" | "maxi";
  payment_method: "Онлайн оплата" | "Переказ на карту";
  notes?: string;
};

interface SubscribeFormHomeProps {
  defaultPlan?: 'mini' | 'maxi';
}

function SubscribeFormHomeContent({ defaultPlan }: SubscribeFormHomeProps) {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardNumber] = useState('5375 4114 0000 0000'); // Номер карты для перевода
  const [cardCopied, setCardCopied] = useState(false);
  const searchParams = useSearchParams();

  // Функция копирования номера карты
  const copyCardNumber = async () => {
    try {
      await navigator.clipboard.writeText(cardNumber);
      setCardCopied(true);
      setTimeout(() => setCardCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy card number:', err);
    }
  };

  const {
    register, handleSubmit, formState: { errors }, watch, setValue, trigger
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      subscription_type: defaultPlan || "mini",
      payment_method: "Онлайн оплата",
      phone: "+380",
    }
  });



  // авто-подстановка тарифа из URL (?plan=mini|maxi), sessionStorage или defaultPlan
  useEffect(() => {
    const plan = searchParams?.get("plan");
    if (plan === "mini" || plan === "maxi") {
      setValue("subscription_type", plan);
      return;
    }
    
    // Проверяем defaultPlan
    if (defaultPlan && (defaultPlan === "mini" || defaultPlan === "maxi")) {
      setValue("subscription_type", defaultPlan);
      return;
    }
    
    // Проверяем sessionStorage для выбранного плана только на клиенте
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('selected_plan');
        if (saved === 'mini' || saved === 'maxi') {
          setValue("subscription_type", saved);
          sessionStorage.removeItem('selected_plan');
        }
      } catch {
        // Игнорируем ошибки sessionStorage
      }
    }
  }, [searchParams, setValue, defaultPlan]);

  // авто-префікс + маска для UA
  const onPhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.currentTarget.value.replace(/\s+/g, "");
    if (!v.startsWith("+380")) v = "+380";
    // Разрешаем только + и цифры, ограничим до +380 + 9 цифр
    v = "+" + v.replace(/[^\d]/g, "");
    if (!v.startsWith("+380")) v = "+380";
    v = v.slice(0, 13);
    setValue("phone", v, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Submit to API with new structure
      const response = await fetch('/api/subscribe', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          social: data.social,
          plan: data.subscription_type,
          paymentMethod: data.payment_method,
          message: data.notes,
          privacyConsent: true
        })
      });

      const result = await response.json();

      if (response.ok) {
        logger.info('Home subscription form submitted successfully', { 
          requestId: result.requestId, 
          plan: data.subscription_type,
          paymentMethod: data.payment_method,
          hasPayment: !!result.payment
        });
        
        // Если есть данные платежа, перенаправляем на оплату
        if (result.payment && result.payment.paymentUrl) {
          window.location.href = result.payment.paymentUrl;
          return;
        }
        
        setSent(true);
      } else {
        throw new Error(result.error || 'Server error');
      }
      
    } catch (error) {
      logger.error('Home subscription form error', error);
      alert(`Помилка відправки форми: ${error instanceof Error ? error.message : 'Невідома помилка'}`);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <section className="py-4 px-6" id="subscribe">
        <div className="mx-auto max-w-2xl">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-2 rounded-[var(--radius-lg)] bg-[var(--success)]/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="h2 mb-2">Заявку надіслано!</h3>
            <p className="text-[var(--text-muted)] mb-6">
              Дякуємо за заявку! Ми зв&apos;яжемося з вами найближчим часом для підтвердження підписки.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                asChild
              >
                <Link href="/books#top">Переглянути книги</Link>
              </Button>
              <Button
                asChild
                className="btn btn-primary"
              >
                <Link href="/subscribe">Обрати інший план</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 px-6" id="subscribe">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-6">
          <h2 className="h1 mb-2">
            Оформити підписку
          </h2>
          <p className="lead">
            Заповніть форму і ми зв&apos;яжемося з вами найближчим часом
          </p>
          <div className="mt-4 inline-flex items-center gap-4 text-base">
            <span className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--success)]/10 px-4 py-2 text-[var(--success)]">
              Mini — 300 ₴/міс
            </span>
            <span className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--brand)]/10 px-4 py-2 text-[var(--accent)]">
              Maxi — 500 ₴/міс
            </span>
          </div>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Основные поля в компактном виде */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="label">
                  Ім&apos;я та прізвище *
                </label>
                <input
                  {...register("name")}
                  id="name"
                  type="text"
                  className="field"
                  placeholder="Іван Петренко"
                />
                {errors.name && (
                  <p className="help is-error">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="label">
                  Телефон *
                </label>
                <input
                  {...register("phone")}
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  onChange={onPhoneInput}
                  onBlur={() => trigger("phone")}
                  className="field"
                  placeholder="+380 XX XXX XX XX"
                />
                {errors.phone && (
                  <p className="help is-error">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="label">
                  Email *
                </label>
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  className="field"
                  placeholder="you@email.com"
                />
                {errors.email && (
                  <p className="help is-error">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="social" className="label">
                  Нік в Telegram/Instagram *
                </label>
                <input
                  {...register("social")}
                  id="social"
                  type="text"
                  className="field"
                  placeholder="@username"
                />
                {errors.social && (
                  <p className="help is-error">{errors.social.message}</p>
                )}
              </div>
            </div>

            {/* План подписки */}
            <div>
              <label className="label">
                План підписки *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`relative rounded-[var(--radius-md)] border-2 p-3 cursor-pointer transition-all ${
                    watch("subscription_type") === 'mini'
                      ? 'border-[var(--success)] bg-[var(--success)]/10'
                      : 'border-[var(--line)] hover:border-[var(--text-muted)]'
                  }`}
                  onClick={() => setValue('subscription_type', 'mini')}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-[var(--radius-sm)] border-2 flex items-center justify-center ${
                      watch("subscription_type") === 'mini' ? 'border-[var(--success)] bg-[var(--success)]' : 'border-[var(--line)]'
                    }`}>
                      {watch("subscription_type") === 'mini' && <div className="w-1.5 h-1.5 bg-[var(--surface)] rounded-[var(--radius-sm)]" />}
                    </div>
                    <div>
                      <p className={`font-semibold small ${watch("subscription_type") === 'mini' ? 'text-[var(--success)]' : 'text-[var(--text)]'}`}>
                        Mini
                      </p>
                      <p className={`tiny ${watch("subscription_type") === 'mini' ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
                        300 ₴/міс
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`relative rounded-[var(--radius-md)] border-2 p-3 cursor-pointer transition-all ${
                    watch("subscription_type") === 'maxi'
                      ? 'border-[var(--brand)] bg-[var(--brand)]/10'
                      : 'border-[var(--line)] hover:border-[var(--text-muted)]'
                  }`}
                  onClick={() => setValue('subscription_type', 'maxi')}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-[var(--radius-sm)] border-2 flex items-center justify-center ${
                      watch("subscription_type") === 'maxi' ? 'border-[var(--brand)] bg-[var(--brand)]' : 'border-[var(--line)]'
                    }`}>
                      {watch("subscription_type") === 'maxi' && <div className="w-1.5 h-1.5 bg-[var(--surface)] rounded-[var(--radius-sm)]" />}
                    </div>
                    <div>
                      <p className={`font-semibold small ${watch("subscription_type") === 'maxi' ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                        Maxi
                      </p>
                      <p className={`tiny ${watch("subscription_type") === 'maxi' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                        500 ₴/міс
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <input type="hidden" {...register('subscription_type')} />
            </div>

            {/* Способ оплаты */}
            <div>
              <label className="block text-body font-semibold text-neutral-700 mb-2">
                Спосіб оплати *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`relative rounded-lg border-2 p-3 cursor-pointer transition-all ${
                    watch("payment_method") === 'Онлайн оплата'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => setValue('payment_method', 'Онлайн оплата')}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-2xl border-2 flex items-center justify-center ${
                      watch("payment_method") === 'Онлайн оплата' ? 'border-blue-500 bg-blue-500' : 'border-neutral-300'
                    }`}>
                      {watch("payment_method") === 'Онлайн оплата' && <div className="w-1.5 h-1.5 bg-neutral-0 rounded-2xl" />}
                    </div>
                    <div>
                      <p className={`font-semibold text-body ${watch("payment_method") === 'Онлайн оплата' ? 'text-blue-900' : 'text-neutral-700'}`}>
                        Онлайн оплата
                      </p>
                      <p className={`text-caption ${watch("payment_method") === 'Онлайн оплата' ? 'text-blue-700' : 'text-neutral-500'}`}>
                        Банківською карткою
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`relative rounded-lg border-2 p-3 cursor-pointer transition-all ${
                    watch("payment_method") === 'Переказ на карту'
                      ? 'border-green-500 bg-green-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                  onClick={() => setValue('payment_method', 'Переказ на карту')}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-2xl border-2 flex items-center justify-center ${
                      watch("payment_method") === 'Переказ на карту' ? 'border-green-500 bg-green-500' : 'border-neutral-300'
                    }`}>
                      {watch("payment_method") === 'Переказ на карту' && <div className="w-1.5 h-1.5 bg-neutral-0 rounded-2xl" />}
                    </div>
                    <div>
                      <p className={`font-semibold text-body ${watch("payment_method") === 'Переказ на карту' ? 'text-green-900' : 'text-neutral-700'}`}>
                        Переказ на карту
                      </p>
                      <p className={`text-caption ${watch("payment_method") === 'Переказ на карту' ? 'text-green-700' : 'text-neutral-500'}`}>
                        ПриватБанк
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <input type="hidden" {...register('payment_method')} />
            </div>

            {/* Номер карты для перевода */}
            {watch("payment_method") === 'Переказ на карту' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-body font-semibold text-green-800">
                    Номер карты для перевода
                  </label>
                  <Button
                    type="button"
                    onClick={copyCardNumber}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      cardCopied 
                        ? 'bg-green-600 text-neutral-0' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {cardCopied ? 'Скопіровано!' : 'Копіювати'}
                  </Button>
                </div>
                <div className="bg-neutral-0 border border-green-300 rounded-lg p-3">
                  <code className="text-lg font-mono text-neutral-800 select-all">
                    {cardNumber}
                  </code>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  💡 Натисніть &quot;Копіювати&quot; щоб скопіювати номер карты в буфер обміну
                </p>
              </div>
            )}

            {/* Информация об онлайн оплате */}
            {watch("payment_method") === 'Онлайн оплата' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-body font-semibold text-blue-800">
                    Онлайн оплата через Монобанк
                  </p>
                </div>
                <p className="text-sm text-blue-700">
                  Після відправки заявки ви будете перенаправлені на сторінку безпечної оплати
                </p>
              </div>
            )}

            {/* Дополнительная информация */}
            <div>
              <label htmlFor="notes" className="label">
                Додаткова інформація (опціонально)
              </label>
              <textarea
                {...register("notes")}
                id="notes"
                rows={3}
                className="field"
                placeholder="Ваші побажання або питання..."
              />
            </div>

            {/* Кнопка отправки */}
            <Button
              type="submit"
              disabled={isSubmitting || !watch("subscription_type") || !watch("payment_method")}
              className="btn btn-primary btn-lg btn-block"
            >
              {isSubmitting ? 'Відправляємо...' : 'Оформити підписку'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default function SubscribeFormHome({ defaultPlan }: SubscribeFormHomeProps = {}) {
  return (
    <Suspense fallback={<div>Завантаження...</div>}>
      <SubscribeFormHomeContent defaultPlan={defaultPlan} />
    </Suspense>
  );
}