"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Info, CreditCard, Building2, Copy, Check } from "lucide-react";
import { logger } from "@/lib/logger";

type FormData = {
  name: string;
  phone: string;
  email: string;
  social?: string;
  bookId?: string;
  plan: "Mini" | "Maxi";
  delivery: "Самовивіз";
  payment: "Онлайн оплата" | "Переказ на карту" | "Готівка при отриманні";
  note?: string;
  privacyConsent: boolean;
  screenshot?: FileList;
};

export default function RentalForm({ bookId }: { bookId?: string }) {
  const [sent, setSent] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'online' | null>(null);
  const [copiedCard, setCopiedCard] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset, setValue, trigger } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: { plan: "Mini", delivery: "Самовивіз", bookId, email: "", phone: "+380", privacyConsent: false, payment: "Онлайн оплата" }
  });

  // авто-префікс + маска для UA
  const copyCardNumber = async () => {
    try {
      await navigator.clipboard.writeText('5408810041850776');
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2000);
    } catch (err) {
      console.error('Failed to copy card number:', err);
    }
  };

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
    try {
      const response = await fetch('/api/rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        logger.info('Rental form submitted successfully', { rentalId: result.rentalId });
        setSent(true);
        reset();
      } else {
        logger.error('Rental form submission failed', { error: result.error });
        alert(`Помилка: ${result.error}`);
      }
    } catch (error) {
      logger.error('Rental form submission error', error);
      alert('Помилка відправки форми. Спробуйте ще раз.');
    }
  };

  if (sent) return (
    <div className="max-w-2xl mx-auto">
      <div className="p-6 rounded-xl bg-green-50 border border-green-200">
        <p className="font-semibold text-green-900">Заявку надіслано!</p>
        <p className="text-body text-green-800 mt-2">Ми зв&apos;яжемося з вами для підтвердження оренди.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-body font-semibold text-gray-700 mb-2">Ім&apos;я*</label>
            <input id="name" className="input px-3 py-2 text-body w-full" placeholder="Іван Петренко" {...register("name")} />
            {errors.name && <span className="text-caption text-red-600 mt-1">{errors.name.message}</span>}
          </div>
          <div>
            <label htmlFor="phone" className="block text-body font-semibold text-gray-700 mb-2">Телефон*</label>
            <input 
              {...register("phone")}
              id="phone" 
              type="tel"
              inputMode="tel"
              onChange={onPhoneInput}
              onBlur={() => trigger("phone")}
              className="input px-3 py-2 text-body w-full" 
              placeholder="+380 95 123 45 67" 
            />
            {errors.phone && <span className="text-caption text-red-600 mt-1">{errors.phone.message}</span>}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-body font-semibold text-gray-700 mb-2">Email*</label>
            <input id="email" className="input px-3 py-2 text-body w-full" placeholder="your@email.com" {...register("email")} />
            {errors.email && <span className="text-caption text-red-600 mt-1">{errors.email.message}</span>}
          </div>
          <div>
            <label htmlFor="social" className="block text-body font-semibold text-gray-700 mb-2">Телеграм/Інстаграм</label>
            <input id="social" className="input px-3 py-2 text-body w-full" placeholder="@username або t.me/username" {...register("social")} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="plan" className="block text-body font-semibold text-gray-700 mb-2">План</label>
            <select id="plan" className="input px-3 py-2 text-body w-full" {...register("plan")}>
              <option>Mini</option><option>Maxi</option>
            </select>
          </div>
          <div>
            <label htmlFor="bookId" className="block text-body font-semibold text-gray-700 mb-2">Книга (ID)</label>
            <input id="bookId" className="input px-3 py-2 text-body w-full" placeholder="наприклад: 3" {...register("bookId")} />
          </div>
        </div>
        
        {/* Способ оплаты */}
        <div>
          <label className="block text-body font-semibold text-gray-700 mb-2">Спосіб оплати *</label>
          <div className="grid md:grid-cols-2 gap-3">
            <div
              className={`relative rounded-lg border-2 p-3 cursor-pointer transition-all ${
                paymentMethod === 'card'
                  ? 'border-brand-accent bg-blue-50'
                  : paymentMethod === null
                  ? 'border-gray-200 hover:border-gray-300'
                  : 'border-gray-200 opacity-60'
              }`}
              onClick={() => {
                setPaymentMethod('card');
                setValue('payment', 'Переказ на карту');
              }}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-2xl border-2 flex items-center justify-center ${
                  paymentMethod === 'card' ? 'border-brand-accent bg-brand-accent' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'card' && <div className="w-1.5 h-1.5 bg-white rounded-2xl" />}
                </div>
                <Building2 className={`h-5 w-5 ${paymentMethod === 'card' ? 'text-brand-accent-light' : 'text-gray-400'}`} />
                <div>
                  <p className={`font-semibold text-body ${paymentMethod === 'card' ? 'text-blue-900' : 'text-gray-700'}`}>
                    Переказ на карту Monobank
                  </p>
                  <p className={`text-caption ${paymentMethod === 'card' ? 'text-blue-700' : 'text-gray-500'}`}>
                    Отримаєте реквізити для оплати
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`relative rounded-lg border-2 p-3 cursor-pointer transition-all ${
                paymentMethod === 'online'
                  ? 'border-green-500 bg-green-50'
                  : paymentMethod === null
                  ? 'border-gray-200 hover:border-gray-300'
                  : 'border-gray-200 opacity-60'
              }`}
              onClick={() => {
                setPaymentMethod('online');
                setValue('payment', 'Онлайн оплата');
              }}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-2xl border-2 flex items-center justify-center ${
                  paymentMethod === 'online' ? 'border-green-500 bg-green-500' : 'border-gray-300'
                }`}>
                  {paymentMethod === 'online' && <div className="w-1.5 h-1.5 bg-white rounded-2xl" />}
                </div>
                <CreditCard className={`h-5 w-5 ${paymentMethod === 'online' ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <p className={`font-semibold text-body ${paymentMethod === 'online' ? 'text-green-900' : 'text-gray-700'}`}>
                    Онлайн оплата
                  </p>
                  <p className={`text-caption ${paymentMethod === 'online' ? 'text-green-700' : 'text-gray-500'}`}>
                    Картою через інтернет
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Информация для перевода */}
        {paymentMethod === 'card' && (
          <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <h3 className="text-body-lg font-semibold text-blue-900 mb-4">
              Інформація для переказу
            </h3>
            
            <div className="space-y-4">
              {/* Номер карты */}
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-blue-200">
                <div>
                  <p className="text-body font-semibold text-gray-600 mb-1">Номер карти:</p>
                  <p className="text-h3 text-brand-accent-light tracking-wider">5408 8100 4185 0776</p>
                </div>
                <button
                  type="button"
                  onClick={copyCardNumber}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                >
                  {copiedCard ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span className="text-body-sm font-medium">Скопійовано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span className="text-body-sm font-medium">Копіювати</span>
                    </>
                  )}
                </button>
              </div>

              {/* Получатель */}
              <div className="p-4 bg-white rounded-xl border border-blue-200">
                <p className="text-body font-semibold text-gray-600 mb-1">Отримувач:</p>
                <p className="text-body-lg font-semibold text-gray-900">Федорова Анастасія</p>
              </div>

              {/* Банк */}
              <div className="p-4 bg-white rounded-xl border border-blue-200">
                <p className="text-body font-semibold text-gray-600 mb-1">Банк:</p>
                <p className="text-body-lg font-semibold text-gray-900">Монобанк</p>
              </div>
            </div>

            {/* Важная информация */}
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-brand-yellow-dark flex-shrink-0 mt-0.5" />
                <div className="text-body text-yellow-800">
                  <p className="font-semibold mb-2">Важливо:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Зробіть переказ на вказану карту</li>
                    <li>Зробіть скріншот підтвердження оплати</li>
                    <li>Завантажте скріншот у формі нижче</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Скриншот для перевода на карту */}
        {paymentMethod === 'card' && (
          <div>
            <label htmlFor="screenshot" className="block text-body font-semibold text-gray-700 mb-2">Скріншот оплати *</label>
            <input
              {...register("screenshot", {
                required: paymentMethod === 'card' ? "Скріншот оплати обов'язковий" : false
              })}
              id="screenshot"
              type="file"
              accept="image/*"
              className="w-full input file:mr-4 file:py-2 file:px-4 file:rounded-2xl file:border-0 file:text-body file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            <p className="mt-1 text-body text-gray-500">
              Завантажте скріншот підтвердження переказу (JPG, PNG до 10MB)
            </p>
            {errors.screenshot && (
              <span className="text-caption text-red-600 mt-1">{errors.screenshot.message}</span>
            )}
          </div>
        )}
        
        <div>
          <label htmlFor="note" className="block text-body font-semibold text-gray-700 mb-2">Коментар</label>
          <textarea id="note" className="w-full input px-3 py-2 text-body min-h-[80px]" placeholder="Побажання, час зв&apos;язку" {...register("note")} />
        </div>
        
        {/* Согласие на обработку данных */}
        <div className="flex items-start gap-3">
          <input
            {...register('privacyConsent', {
              required: 'Необхідно підтвердити згоду на обробку даних'
            })}
            id="privacyConsent"
            type="checkbox"
            className="mt-1 w-4 h-4 text-brand-accent-light bg-gray-100 border-gray-300 rounded focus:ring-brand-accent focus:ring-2"
          />
          <label htmlFor="privacyConsent" className="text-body text-muted">
            Я погоджуюся з обробкою моїх персональних даних відповідно до політики конфіденційності
            {errors.privacyConsent && (
              <span className="block text-caption text-red-600 mt-1">{errors.privacyConsent.message}</span>
            )}
          </label>
        </div>
        
        <button type="submit" className="btn-base bg-[--ink] text-white rounded-xl h-10 px-6 text-body font-semibold mt-2">Надіслати заявку</button>
      </form>
    </div>
  );
}
