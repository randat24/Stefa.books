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
import type { Book } from "@/lib/supabase";

type DeliveryMethod = "courier" | "pickup" | "post";

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
  address: z.string().min(10, "Введіть повну адресу").optional(),
  city: z.string().min(2, "Введіть назву міста").optional(),
  novaPoshtaNumber: z.string().min(1, "Введіть номер відділення").optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "Ви повинні погодитись з умовами використання"
  }),
  subscribeToNewsletter: z.boolean().optional()
});

type OrderFormData = z.infer<typeof orderSchema>;

export function OrderConfirmationForm({ book, plan, deliveryMethod }: OrderConfirmationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Order data:", {
        ...data,
        book: book.id,
        plan: plan.id,
        deliveryMethod
      });
      
      setSubmitSuccess(true);
    } catch (error) {
      console.error("Order submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deliveryMethodNames = {
    courier: "Кур'єр",
    pickup: "Самовивіз",
    post: "Нова Пошта"
  };

  if (submitSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-2xl flex items-center justify-center mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-h2 text-neutral-900 mb-2">
          Замовлення оформлено!
        </h3>
        <p className="text-neutral-600 mb-6">
          Ми надіслали підтвердження на вашу електронну пошту. 
          Найближчим часом з вами зв&apos;яжеться наш менеджер.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
          <h4 className="font-semibold text-blue-900 mb-2">Що далі?</h4>
          <ul className="text-body-sm text-blue-800 space-y-1">
            <li>• Перевіримо наявність книги</li>
            <li>• Підготуємо до відправлення</li>
            <li>• Повідомимо про доставку</li>
          </ul>
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

        {/* Delivery Address */}
        {deliveryMethod !== "pickup" && (
          <div className="card p-6">
            <h3 className="text-body-lg font-semibold text-neutral-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              {deliveryMethod === "courier" ? "Адреса доставки" : "Відділення Нової Пошти"}
            </h3>
            
            {deliveryMethod === "courier" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-body-sm font-medium text-neutral-700 mb-2">
                    Місто *
                  </label>
                  <input
                    type="text"
                    {...register("city")}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent ${
                      errors.city ? "border-red-300" : "border-neutral-300"
                    }`}
                    placeholder="Київ"
                  />
                  {errors.city && (
                    <p className="mt-1 text-body-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-neutral-700 mb-2">
                    Повна адреса *
                  </label>
                  <textarea
                    {...register("address")}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent ${
                      errors.address ? "border-red-300" : "border-neutral-300"
                    }`}
                    placeholder="вул. Хрещатик, 1, кв. 10"
                  />
                  {errors.address && (
                    <p className="mt-1 text-body-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {deliveryMethod === "post" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-body-sm font-medium text-neutral-700 mb-2">
                    Місто *
                  </label>
                  <input
                    type="text"
                    {...register("city")}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent ${
                      errors.city ? "border-red-300" : "border-neutral-300"
                    }`}
                    placeholder="Київ"
                  />
                  {errors.city && (
                    <p className="mt-1 text-body-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-body-sm font-medium text-neutral-700 mb-2">
                    Номер відділення *
                  </label>
                  <input
                    type="text"
                    {...register("novaPoshtaNumber")}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent ${
                      errors.novaPoshtaNumber ? "border-red-300" : "border-neutral-300"
                    }`}
                    placeholder="№1, №2, №15..."
                  />
                  {errors.novaPoshtaNumber && (
                    <p className="mt-1 text-body-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.novaPoshtaNumber.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

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
                Оформлюємо замовлення...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Підтвердити замовлення
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}