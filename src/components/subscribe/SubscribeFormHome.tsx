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
          <div className="rounded-3xl bg-white border border-gray-200 shadow-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-h2 text-gray-900 mb-2">Заявку надіслано!</h3>
            <p className="text-gray-600 mb-6">
              Дякуємо за заявку! Ми зв&apos;яжемося з вами найближчим часом для підтвердження підписки.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                asChild
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
              >
                <Link href="/books#top">Переглянути книги</Link>
              </Button>
              <Button
                asChild
                className="bg-brand-yellow hover:bg-brand-yellow-dark text-gray-900 border-0"
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
          <h2 className="text-h1 font-semibold tracking-tight text-gray-900 mb-2">
            Оформити підписку
          </h2>
          <p className="text-body-lg text-gray-600">
            Заповніть форму і ми зв&apos;яжемося з вами найближчим часом
          </p>
          <div className="mt-4 inline-flex items-center gap-4 text-base">
            <span className="inline-flex items-center gap-2 rounded-2xl bg-green-100 px-4 py-2 text-green-700">
              Mini — 300 ₴/міс
            </span>
            <span className="inline-flex items-center gap-2 rounded-2xl bg-yellow-100 px-4 py-2 text-yellow-700">
              Maxi — 500 ₴/міс
            </span>
          </div>
        </div>

        <div className="rounded-3xl bg-white border border-gray-200 shadow-xl p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Основные поля в компактном виде */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-body font-semibold text-gray-700 mb-2">
                  Ім&apos;я та прізвище *
                </label>
                <input
                  {...register("name")}
                  id="name"
                  type="text"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Іван Петренко"
                />
                {errors.name && (
                  <p className="mt-1 text-body text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-body font-semibold text-gray-700 mb-2">
                  Телефон *
                </label>
                <input
                  {...register("phone")}
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  onChange={onPhoneInput}
                  onBlur={() => trigger("phone")}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="+380 XX XXX XX XX"
                />
                {errors.phone && (
                  <p className="mt-1 text-body text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-body font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="you@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-body text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="social" className="block text-body font-semibold text-gray-700 mb-2">
                  Нік в Telegram/Instagram *
                </label>
                <input
                  {...register("social")}
                  id="social"
                  type="text"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="@username"
                />
                {errors.social && (
                  <p className="mt-1 text-body text-red-600">{errors.social.message}</p>
                )}
              </div>
            </div>

            {/* План подписки */}
            <div>
              <label className="block text-body font-semibold text-gray-700 mb-2">
                План підписки *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`relative rounded-lg border-2 p-3 cursor-pointer transition-all ${
                    watch("subscription_type") === 'mini'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setValue('subscription_type', 'mini')}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-2xl border-2 flex items-center justify-center ${
                      watch("subscription_type") === 'mini' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                    }`}>
                      {watch("subscription_type") === 'mini' && <div className="w-1.5 h-1.5 bg-white rounded-2xl" />}
                    </div>
                    <div>
                      <p className={`font-semibold text-body ${watch("subscription_type") === 'mini' ? 'text-green-900' : 'text-gray-700'}`}>
                        Mini
                      </p>
                      <p className={`text-caption ${watch("subscription_type") === 'mini' ? 'text-green-700' : 'text-gray-500'}`}>
                        300 ₴/міс
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`relative rounded-lg border-2 p-3 cursor-pointer transition-all ${
                    watch("subscription_type") === 'maxi'
                      ? 'border-brand-yellow bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setValue('subscription_type', 'maxi')}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-2xl border-2 flex items-center justify-center ${
                      watch("subscription_type") === 'maxi' ? 'border-brand-yellow bg-brand-yellow' : 'border-gray-300'
                    }`}>
                      {watch("subscription_type") === 'maxi' && <div className="w-1.5 h-1.5 bg-white rounded-2xl" />}
                    </div>
                    <div>
                      <p className={`font-semibold text-body ${watch("subscription_type") === 'maxi' ? 'text-yellow-900' : 'text-gray-700'}`}>
                        Maxi
                      </p>
                      <p className={`text-caption ${watch("subscription_type") === 'maxi' ? 'text-yellow-700' : 'text-gray-500'}`}>
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
              <label className="block text-body font-semibold text-gray-700 mb-2">
                Спосіб оплати *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`relative rounded-lg border-2 p-3 cursor-pointer transition-all ${
                    watch("payment_method") === 'Онлайн оплата'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setValue('payment_method', 'Онлайн оплата')}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-2xl border-2 flex items-center justify-center ${
                      watch("payment_method") === 'Онлайн оплата' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {watch("payment_method") === 'Онлайн оплата' && <div className="w-1.5 h-1.5 bg-white rounded-2xl" />}
                    </div>
                    <div>
                      <p className={`font-semibold text-body ${watch("payment_method") === 'Онлайн оплата' ? 'text-blue-900' : 'text-gray-700'}`}>
                        Онлайн оплата
                      </p>
                      <p className={`text-caption ${watch("payment_method") === 'Онлайн оплата' ? 'text-blue-700' : 'text-gray-500'}`}>
                        Банківською карткою
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`relative rounded-lg border-2 p-3 cursor-pointer transition-all ${
                    watch("payment_method") === 'Переказ на карту'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setValue('payment_method', 'Переказ на карту')}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-2xl border-2 flex items-center justify-center ${
                      watch("payment_method") === 'Переказ на карту' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                    }`}>
                      {watch("payment_method") === 'Переказ на карту' && <div className="w-1.5 h-1.5 bg-white rounded-2xl" />}
                    </div>
                    <div>
                      <p className={`font-semibold text-body ${watch("payment_method") === 'Переказ на карту' ? 'text-green-900' : 'text-gray-700'}`}>
                        Переказ на карту
                      </p>
                      <p className={`text-caption ${watch("payment_method") === 'Переказ на карту' ? 'text-green-700' : 'text-gray-500'}`}>
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
                        ? 'bg-green-600 text-white' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {cardCopied ? 'Скопіровано!' : 'Копіювати'}
                  </Button>
                </div>
                <div className="bg-white border border-green-300 rounded-lg p-3">
                  <code className="text-lg font-mono text-gray-800 select-all">
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
              <label htmlFor="notes" className="block text-body font-semibold text-gray-700 mb-2">
                Додаткова інформація (опціонально)
              </label>
              <textarea
                {...register("notes")}
                id="notes"
                rows={3}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                placeholder="Ваші побажання або питання..."
              />
            </div>

            {/* Кнопка отправки */}
            <Button
              type="submit"
              disabled={isSubmitting || !watch("subscription_type") || !watch("payment_method")}
              className="w-full bg-brand-yellow hover:bg-brand-yellow-dark disabled:bg-gray-400 text-gray-900 py-3 px-6 rounded-xl text-body font-semibold transition-colors"
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