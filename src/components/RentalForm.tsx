"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Info, CreditCard, Building2, Copy, Check } from "lucide-react";
import { logger } from "@/lib/logger";
import { z } from "zod";

// Схема валидации, соответствующая API
const rentalFormSchema = z.object({
  book_id: z.string().uuid('Невірний ID книги'),
  first_name: z.string().min(1, 'Ім\'я обов\'язкове'),
  last_name: z.string().min(1, 'Прізвище обов\'язкове'),
  email: z.string().email('Невірний email'),
  phone: z.string().min(10, 'Невірний номер телефону'),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  notes: z.string().optional(),
  plan: z.enum(['basic', 'extended', 'premium']),
  delivery_method: z.enum(['pickup', 'kyiv', 'ukraine']),
  payment_method: z.enum(['card', 'cash', 'bank']),
  privacyConsent: z.boolean().refine(val => val === true, 'Необхідно підтвердити згоду')
});

type FormData = {
  book_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postal_code?: string;
  notes?: string;
  plan: 'basic' | 'extended' | 'premium';
  delivery_method: 'pickup' | 'kyiv' | 'ukraine';
  payment_method: 'card' | 'cash' | 'bank';
  privacyConsent: boolean;
};

// Конфигурация планов аренды
const RENTAL_PLANS = [
  { id: 'basic', name: 'Базова оренда (7 днів)', price: 50, description: 'Стандартний період аренди' },
  { id: 'extended', name: 'Розширена оренда (14 днів)', price: 80, description: 'Подовжений період аренди' },
  { id: 'premium', name: 'Преміум оренда (30 днів)', price: 120, description: 'Максимальний період аренди' }
] as const;

// Способы доставки
const DELIVERY_METHODS = [
  { id: 'pickup', name: 'Самовивіз з бібліотеки', price: 0, description: 'Безкоштовно' },
  { id: 'kyiv', name: 'Доставка по Києву', price: 0, description: 'Безкоштовна доставка' }
] as const;

// Способы оплаты
const PAYMENT_METHODS = [
  { id: 'card', name: 'Банківська картка', description: 'Онлайн оплата' },
  { id: 'cash', name: 'Готівка при отриманні', description: 'Оплата при доставці' },
  { id: 'bank', name: 'Банківський переказ', description: 'Переказ на рахунок' }
] as const;

export default function RentalForm({ bookId }: { bookId?: string }) {
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'extended' | 'premium'>('basic');
  const [selectedDelivery, setSelectedDelivery] = useState<'pickup' | 'kyiv' | 'ukraine'>('kyiv');
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'cash' | 'bank'>('card');
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: { 
      book_id: bookId || '',
      first_name: '',
      last_name: '',
      email: '', 
      phone: '+380', 
      address: '',
      city: 'Київ',
      postal_code: '',
      notes: '',
      plan: 'basic',
      delivery_method: 'kyiv',
      payment_method: 'card',
      privacyConsent: false 
    }
  });

  // Вычисляем общую стоимость
  const currentPlan = RENTAL_PLANS.find(p => p.id === selectedPlan) || RENTAL_PLANS[0];
  const currentDelivery = DELIVERY_METHODS.find(d => d.id === selectedDelivery) || DELIVERY_METHODS[1];
  const totalPrice = currentPlan.price + currentDelivery.price;

  // Обработчик изменения плана
  const handlePlanChange = (planId: 'basic' | 'extended' | 'premium') => {
    setSelectedPlan(planId);
    setValue('plan', planId);
  };

  // Обработчик изменения способа доставки
  const handleDeliveryChange = (deliveryId: 'pickup' | 'kyiv' | 'ukraine') => {
    setSelectedDelivery(deliveryId);
    setValue('delivery_method', deliveryId);
  };

  // Обработчик изменения способа оплаты
  const handlePaymentChange = (paymentId: 'card' | 'cash' | 'bank') => {
    setSelectedPayment(paymentId);
    setValue('payment_method', paymentId);
  };

  // Обработчик форматирования телефона
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (!value.startsWith('380')) {
      value = '380' + value;
    }
    value = '+' + value.slice(0, 12);
    setValue('phone', value);
  };

  const onSubmit = async (data: FormData) => {
    if (!data.book_id) {
      alert('ID книги не вказано');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Валидация данных
      const validatedData = rentalFormSchema.parse(data);
      
      // Формируем данные для API
      const apiData = {
        book_id: validatedData.book_id,
        plan: validatedData.plan,
        delivery_method: validatedData.delivery_method,
        customer_info: {
          first_name: validatedData.first_name,
          last_name: validatedData.last_name,
          email: validatedData.email,
          phone: validatedData.phone,
          address: validatedData.address || '',
          city: validatedData.city || 'Київ',
          postal_code: validatedData.postal_code || '',
          notes: validatedData.notes || ''
        },
        payment_method: validatedData.payment_method,
        total_price: totalPrice
      };

      const response = await fetch('/api/rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });

      const result = await response.json();

      if (result.success) {
        logger.info('Rental form submitted successfully', { rentalId: result.rental_id });
        setSent(true);
        reset();
      } else {
        logger.error('Rental form submission failed', { error: result.error });
        alert(`Помилка: ${result.error}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        alert(`Помилка валідації: ${firstError.message}`);
      } else {
        logger.error('Rental form submission error', error);
        alert('Помилка відправки форми. Спробуйте ще раз.');
      }
    } finally {
      setIsSubmitting(false);
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
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Основная информация */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <h3 className="text-h3 font-semibold text-neutral-900 mb-6">Особиста інформація</h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-body font-semibold text-neutral-700 mb-2">Ім&apos;я*</label>
              <input 
                id="first_name" 
                className="input px-3 py-2 text-body w-full" 
                placeholder="Іван" 
                {...register("first_name", { required: "Ім'я обов'язкове" })}
              />
              {errors.first_name && <span className="text-caption text-red-600 mt-1">{errors.first_name.message}</span>}
            </div>
            
            <div>
              <label htmlFor="last_name" className="block text-body font-semibold text-neutral-700 mb-2">Прізвище*</label>
              <input 
                id="last_name" 
                className="input px-3 py-2 text-body w-full" 
                placeholder="Петренко" 
                {...register("last_name", { required: "Прізвище обов'язкове" })}
              />
              {errors.last_name && <span className="text-caption text-red-600 mt-1">{errors.last_name.message}</span>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="email" className="block text-body font-semibold text-neutral-700 mb-2">Email*</label>
              <input 
                id="email" 
                type="email"
                className="input px-3 py-2 text-body w-full" 
                placeholder="ivan@example.com" 
                {...register("email", { 
                  required: "Email обов'язковий",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Невірний формат email"
                  }
                })}
              />
              {errors.email && <span className="text-caption text-red-600 mt-1">{errors.email.message}</span>}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-body font-semibold text-neutral-700 mb-2">Телефон*</label>
              <input 
                id="phone" 
                type="tel"
                className="input px-3 py-2 text-body w-full" 
                placeholder="+380501234567" 
                {...register("phone", { required: "Телефон обов'язковий" })}
                onChange={handlePhoneChange}
              />
              {errors.phone && <span className="text-caption text-red-600 mt-1">{errors.phone.message}</span>}
            </div>
          </div>

          {/* Скрытое поле для book_id */}
          <input type="hidden" {...register("book_id")} />
        </div>

        {/* Выбор плана аренды */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <h3 className="text-h3 font-semibold text-neutral-900 mb-6">План оренди</h3>
          
          <div className="grid sm:grid-cols-3 gap-4">
            {RENTAL_PLANS.map((plan) => (
              <div 
                key={plan.id}
                className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
                onClick={() => handlePlanChange(plan.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === plan.id ? 'border-blue-500 bg-blue-500' : 'border-neutral-300'
                  }`}>
                    {selectedPlan === plan.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral-900">{plan.name}</h4>
                    <p className="text-caption text-neutral-600">{plan.description}</p>
                    <p className="text-h4 text-blue-600 font-bold mt-1">{plan.price} ₴</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Способ доставки */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <h3 className="text-h3 font-semibold text-neutral-900 mb-6">Спосіб доставки</h3>
          
          <div className="grid sm:grid-cols-3 gap-4">
            {DELIVERY_METHODS.map((delivery) => (
              <div 
                key={delivery.id}
                className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  selectedDelivery === delivery.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
                onClick={() => handleDeliveryChange(delivery.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedDelivery === delivery.id ? 'border-green-500 bg-green-500' : 'border-neutral-300'
                  }`}>
                    {selectedDelivery === delivery.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral-900">{delivery.name}</h4>
                    <p className="text-caption text-neutral-600">{delivery.description}</p>
                    <p className="text-h4 text-green-600 font-bold mt-1">
                      {delivery.price === 0 ? 'Безкоштовно' : `${delivery.price} ₴`}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Адрес доставки */}
        {selectedDelivery !== 'pickup' && (
          <div className="bg-white rounded-2xl p-6 border border-neutral-200">
            <h3 className="text-h3 font-semibold text-neutral-900 mb-6">Адреса доставки</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-body font-semibold text-neutral-700 mb-2">Адреса</label>
                <input 
                  id="address" 
                  className="input px-3 py-2 text-body w-full" 
                  placeholder="вул. Маріупольська 13/2, Миколаїв" 
                  {...register("address")}
                />
                {errors.address && <span className="text-caption text-red-600 mt-1">{errors.address.message}</span>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-body font-semibold text-neutral-700 mb-2">Місто</label>
                  <input 
                    id="city" 
                    className="input px-3 py-2 text-body w-full" 
                    placeholder="Київ" 
                    {...register("city")}
                  />
                  {errors.city && <span className="text-caption text-red-600 mt-1">{errors.city.message}</span>}
                </div>
                
                <div>
                  <label htmlFor="postal_code" className="block text-body font-semibold text-neutral-700 mb-2">Поштовий індекс</label>
                  <input 
                    id="postal_code" 
                    className="input px-3 py-2 text-body w-full" 
                    placeholder="01001" 
                    {...register("postal_code")}
                  />
                  {errors.postal_code && <span className="text-caption text-red-600 mt-1">{errors.postal_code.message}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Способ оплаты */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <h3 className="text-h3 font-semibold text-neutral-900 mb-6">Спосіб оплати</h3>
          
          <div className="grid sm:grid-cols-3 gap-4">
            {PAYMENT_METHODS.map((payment) => (
              <div 
                key={payment.id}
                className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                  selectedPayment === payment.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
                onClick={() => handlePaymentChange(payment.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    selectedPayment === payment.id ? 'border-purple-500 bg-purple-500' : 'border-neutral-300'
                  }`}>
                    {selectedPayment === payment.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral-900">{payment.name}</h4>
                    <p className="text-caption text-neutral-600">{payment.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Дополнительные заметки */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-200">
          <h3 className="text-h3 font-semibold text-neutral-900 mb-6">Додаткова інформація</h3>
          
          <div>
            <label htmlFor="notes" className="block text-body font-semibold text-neutral-700 mb-2">Коментар</label>
            <textarea 
              id="notes" 
              className="input px-3 py-2 text-body w-full min-h-[100px]" 
              placeholder="Побажання, час зв'язку..." 
              {...register("notes")}
            />
            {errors.notes && <span className="text-caption text-red-600 mt-1">{errors.notes.message}</span>}
          </div>
        </div>

        {/* Итоговая стоимость */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-h3 font-semibold text-neutral-900">Загальна вартість</h3>
              <div className="text-body text-neutral-600 mt-1">
                <p>{currentPlan.name}: {currentPlan.price} ₴</p>
                <p>{currentDelivery.name}: {currentDelivery.price === 0 ? 'Безкоштовно' : `${currentDelivery.price} ₴`}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-h1 font-bold text-blue-600">{totalPrice} ₴</p>
            </div>
          </div>
        </div>

        {/* Согласие на обработку данных */}
        <div className="flex items-start gap-3">
          <input
            {...register('privacyConsent', {
              required: 'Необхідно підтвердити згоду на обробку даних'
            })}
            id="privacyConsent"
            type="checkbox"
            className="mt-1 w-4 h-4 text-blue-600 bg-neutral-100 border-neutral-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="privacyConsent" className="text-body text-neutral-700">
            Я погоджуюся з обробкою моїх персональних даних відповідно до політики конфіденційності
            {errors.privacyConsent && (
              <span className="block text-caption text-red-600 mt-1">{errors.privacyConsent.message}</span>
            )}
          </label>
        </div>
        
        {/* Кнопка отправки */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full btn-base bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl h-12 px-6 text-body font-semibold mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          {isSubmitting ? 'Відправка...' : `Оформити оренду за ${totalPrice} ₴`}
        </button>
      </form>
    </div>
  );
}
