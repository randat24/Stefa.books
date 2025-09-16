"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  MapPin, 
  CheckCircle,
  AlertCircle,
  Loader2,
  CreditCard
} from "lucide-react";
import MonobankPayment from "@/components/payment/MonobankPayment";
import type { Book } from "@/lib/supabase";

type DeliveryMethod = "pickup";

interface SubscriptionPlan {
  id: "mini" | "maxi";
  name: string;
  price: number;
  booksLimit: number;
}

interface OrderConfirmationFormProps {
  book: Book;
  plan: SubscriptionPlan;
  deliveryMethod: DeliveryMethod;
}

const orderSchema = z.object({
  firstName: z.string().min(2, "Ім'я повинно містити мінімум 2 символи"),
  lastName: z.string().min(2, "Прізвище повинно містити мінімум 2 символи"),
  email: z.string().email("Некоректна електронна пошта"),
  phone: z.string().min(10, "Номер телефону повинен містити мінімум 10 цифр"),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "Ви повинні погодитись з умовами використання"
  }),
  subscribeToNewsletter: z.boolean().optional()
});

type OrderFormData = z.infer<typeof orderSchema>;

export function OrderConfirmationForm({ book, plan, deliveryMethod }: OrderConfirmationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderData, setOrderData] = useState<OrderFormData | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema as any)
  });


  const onSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    
    try {
      // Зберігаємо дані замовлення для платежу
      const completeOrderData = {
        ...data,
        book: book.id,
        plan: plan.id,
        deliveryMethod
      };
      
      console.log("Order data:", completeOrderData);
      
      // Зберігаємо дані замовлення та переходимо до оплати
      setOrderData(data);
      setShowPayment(true);
    } catch (error) {
      console.error("Order submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    setSubmitSuccess(true);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // Повертаємося до форми для повторної спроби
    setShowPayment(false);
  };

  const goBackToForm = () => {
    setShowPayment(false);
  };

  const deliveryMethodNames = {
    pickup: "Самовивіз"
  };

  if (submitSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-2xl flex items-center justify-center mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-h2 text-neutral-900 mb-2">
          Оплата успішна!
        </h3>
        <p className="text-neutral-600 mb-6">
          Замовлення оформлено та оплачено. Ми надіслали підтвердження на вашу електронну пошту.
          Найближчим часом з вами зв&apos;яжеться наш менеджер.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
          <h4 className="font-semibold text-blue-900 mb-2">Що далі?</h4>
          <ul className="text-body-sm text-blue-800 space-y-1">
            <li>• Активуємо вашу підписку</li>
            <li>• Перевіримо наявність книги</li>
            <li>• Підготуємо до видачі</li>
            <li>• Надішлемо SMS про готовність</li>
          </ul>
        </div>
      </div>
    );
  }

  if (showPayment && orderData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-h2 text-neutral-900">
            Оплата підписки
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={goBackToForm}
          >
            ← Повернутися
          </Button>
        </div>
        
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          <div>
            <MonobankPayment
              amount={plan.price}
              description={`Підписка ${plan.name} - ${book.title}`}
              currency="UAH"
              customerEmail={orderData.email}
              customerName={`${orderData.firstName} ${orderData.lastName}`}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              returnUrl={`${window.location.origin}/payment/success`}
            />
          </div>
          
          <div className="lg:sticky lg:top-8">
            <div className="card p-6 space-y-4">
              <h4 className="text-body-lg font-semibold text-neutral-900">
                Деталі замовлення
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Книга:</span>
                  <span className="font-medium">{book.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Автор:</span>
                  <span>{book.author}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Тариф:</span>
                  <span className="font-medium">{plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Доставка:</span>
                  <span>{deliveryMethodNames[deliveryMethod]}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>До оплати:</span>
                    <span className="text-brand-accent-light">{plan.price} ₴</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Order Summary */}
      <div className="card p-6 bg-neutral-50">
        <h3 className="text-body-lg font-semibold text-neutral-900 mb-4">
          Деталі замовлення
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-neutral-600">Книга:</span>
            <p className="font-medium">{book.title}</p>
            <p className="text-neutral-600">{book.author}</p>
          </div>
          <div>
            <span className="text-neutral-600">Тариф:</span>
            <p className="font-medium">{plan.name}</p>
            <p className="text-brand-accent-light font-semibold">{plan.price} ₴/міс</p>
          </div>
          <div>
            <span className="text-neutral-600">Доставка:</span>
            <p className="font-medium">{deliveryMethodNames[deliveryMethod]}</p>
            <p className="text-green-600">Безкоштовно</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="card p-6">
          <h3 className="text-body-lg font-semibold text-neutral-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2" />
            Особисті дані
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-neutral-700 mb-2">
                Ім&apos;я *
              </label>
              <input
                type="text"
                {...register("firstName")}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent ${
                  errors.firstName ? "border-red-300" : "border-neutral-300"
                }`}
                placeholder="Ваше ім'я"
              />
              {errors.firstName && (
                <p className="mt-1 text-body-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-body-sm font-medium text-neutral-700 mb-2">
                Прізвище *
              </label>
              <input
                type="text"
                {...register("lastName")}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent ${
                  errors.lastName ? "border-red-300" : "border-neutral-300"
                }`}
                placeholder="Ваше прізвище"
              />
              {errors.lastName && (
                <p className="mt-1 text-body-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card p-6">
          <h3 className="text-body-lg font-semibold text-neutral-900 mb-4 flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Контактна інформація
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-body-sm font-medium text-neutral-700 mb-2">
                Електронна пошта *
              </label>
              <input
                type="email"
                {...register("email")}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent ${
                  errors.email ? "border-red-300" : "border-neutral-300"
                }`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-body-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-body-sm font-medium text-neutral-700 mb-2">
                Номер телефону *
              </label>
              <input
                type="tel"
                {...register("phone")}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent ${
                  errors.phone ? "border-red-300" : "border-neutral-300"
                }`}
                placeholder="+380 XX XXX XX XX"
              />
              {errors.phone && (
                <p className="mt-1 text-body-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pickup Information */}
          <div className="card p-6">
            <h3 className="text-body-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
            Інформація про самовивіз
            </h3>
            
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Адреса пункту видачі:</h4>
            <p className="text-blue-800 mb-2">м. Київ, вул. Хрещатик, 1</p>
            <p className="text-blue-800 mb-2">Пн-Пт: 10:00-19:00, Сб: 10:00-16:00</p>
            <p className="text-blue-800 text-sm">
              Після оформлення замовлення ми надішлемо SMS з деталями про готовність книги до видачі.
            </p>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="card p-6">
          <div className="space-y-4">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                {...register("agreeToTerms")}
                className="mt-1 h-4 w-4 text-brand-accent-light border-neutral-300 rounded focus:ring-brand-accent"
              />
              <span className="text-body-sm text-neutral-700">
                Я погоджуюся з{" "}
                <a href="#" className="text-brand-accent-light hover:text-brand-accent-light/80">
                  умовами використання
                </a>{" "}
                та{" "}
                <a href="#" className="text-brand-accent-light hover:text-brand-accent-light/80">
                  політикою конфіденційності
                </a>{" "}
                *
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="text-body-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.agreeToTerms.message}
              </p>
            )}

            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                {...register("subscribeToNewsletter")}
                className="mt-1 h-4 w-4 text-brand-accent-light border-neutral-300 rounded focus:ring-brand-accent"
              />
              <span className="text-body-sm text-neutral-700">
                Я хочу отримувати новини про нові книги та спеціальні пропозиції
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="px-12 py-4 text-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Обробляємо дані...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Перейти до оплати
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}