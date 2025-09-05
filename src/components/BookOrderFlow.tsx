"use client";

import { useState } from "react";
import Image from "next/image";
import { useUIStore } from "@/store/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { DeliveryMethodSelector } from "@/components/DeliveryMethodSelector";
import { OrderConfirmationForm } from "@/components/OrderConfirmationForm";
import { 
  BookOpen, 
  CheckCircle, 
  Hash, 
  Star,
  ChevronLeft
} from "lucide-react";
import type { Book } from "@/lib/supabase";

interface BookOrderFlowProps {
  book: Book;
}

type OrderStep = "subscription" | "delivery" | "confirmation";
type DeliveryMethod = "courier" | "pickup" | "post";

interface SubscriptionPlan {
  id: "mini" | "maxi";
  name: string;
  price: number;
  booksLimit: number;
  features: string[];
  popular?: boolean;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "mini",
    name: "Mini",
    price: 300,
    booksLimit: 1,
    features: [
      "1 книга за раз",
      "Безкоштовна доставка",
      "Можна змінювати книги",
      "Скасування в будь-який час"
    ]
  },
  {
    id: "maxi",
    name: "Maxi",
    price: 500,
    booksLimit: 2,
    features: [
      "2 книги за раз",
      "Безкоштовна доставка",
      "Можна змінювати книги",
      "Скасування в будь-який час",
      "Пріоритетна підтримка"
    ],
    popular: true
  }
];

export function BookOrderFlow({ book }: BookOrderFlowProps) {
  const { selectedPlan, setSelectedPlan } = useUIStore();
  const [currentStep, setCurrentStep] = useState<OrderStep>("subscription");
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryMethod | null>(null);

  const goToNextStep = () => {
    if (currentStep === "subscription" && selectedPlan) {
      setCurrentStep("delivery");
    } else if (currentStep === "delivery" && selectedDelivery) {
      setCurrentStep("confirmation");
    }
  };

  const goToPrevStep = () => {
    if (currentStep === "delivery") {
      setCurrentStep("subscription");
    } else if (currentStep === "confirmation") {
      setCurrentStep("delivery");
    }
  };

  const canProceed = () => {
    if (currentStep === "subscription") return selectedPlan !== null;
    if (currentStep === "delivery") return selectedDelivery !== null;
    return false;
  };

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-8">
      {/* Main Content */}
      <div className="space-y-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep === "subscription" 
                ? "bg-brand-accent-light text-white" 
                : "bg-green-600 text-white"
            }`}>
              {currentStep === "subscription" ? "1" : <CheckCircle className="h-5 w-5" />}
            </div>
            <span className={`text-sm font-medium ${
              currentStep === "subscription" ? "text-brand-accent-light" : "text-green-600"
            }`}>
              Підписка
            </span>
          </div>

          <div className={`h-px flex-1 mx-4 ${
            currentStep === "subscription" ? "bg-gray-200" : "bg-green-600"
          }`} />

          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep === "subscription"
                ? "bg-gray-200 text-gray-500"
                : currentStep === "delivery"
                ? "bg-brand-accent-light text-white"
                : "bg-green-600 text-white"
            }`}>
              {currentStep === "confirmation" ? <CheckCircle className="h-5 w-5" /> : "2"}
            </div>
            <span className={`text-sm font-medium ${
              currentStep === "subscription"
                ? "text-gray-500"
                : currentStep === "delivery"
                ? "text-brand-accent-light"
                : "text-green-600"
            }`}>
              Доставка
            </span>
          </div>

          <div className={`h-px flex-1 mx-4 ${
            currentStep === "confirmation" ? "bg-green-600" : "bg-gray-200"
          }`} />

          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep === "confirmation"
                ? "bg-brand-accent-light text-white"
                : "bg-gray-200 text-gray-500"
            }`}>
              3
            </div>
            <span className={`text-sm font-medium ${
              currentStep === "confirmation" ? "text-brand-accent-light" : "text-gray-500"
            }`}>
              Підтвердження
            </span>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === "subscription" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Оберіть тариф підписки
              </h2>
              <p className="text-gray-600">
                Оберіть зручний для вас тариф, щоб почати читати українські дитячі книги
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative card p-6 cursor-pointer transition-all hover:shadow-lg ${
                    selectedPlan === plan.id
                      ? "border-2 border-brand-accent-light bg-blue-50"
                      : "border border-gray-200"
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-6">
                      <Badge variant="default" className="bg-brand-accent-light">
                        <Star className="h-3 w-3 mr-1" />
                        Популярний
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {plan.name}
                    </h3>
                    {selectedPlan === plan.id && (
                      <CheckCircle className="h-6 w-6 text-brand-accent-light" />
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-brand-accent-light">
                      {plan.price} ₴<span className="text-lg text-gray-500">/міс</span>
                    </p>
                    <p className="text-gray-600 mt-1">
                      {plan.booksLimit} книг{plan.booksLimit > 1 ? "и" : "а"} за раз
                    </p>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === "delivery" && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="md"
                onClick={goToPrevStep}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Назад
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Спосіб отримання
                </h2>
                <p className="text-gray-600">
                  Оберіть як ви хочете отримати книгу
                </p>
              </div>
            </div>

            <DeliveryMethodSelector
              selected={selectedDelivery}
              onSelect={setSelectedDelivery}
            />
          </div>
        )}

        {currentStep === "confirmation" && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="md"
                onClick={goToPrevStep}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Назад
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Підтвердження замовлення
                </h2>
                <p className="text-gray-600">
                  Перевірте деталі замовлення та залиште свої дані
                </p>
              </div>
            </div>

            <OrderConfirmationForm
              book={book}
              plan={subscriptionPlans.find(p => p.id === selectedPlan)!}
              deliveryMethod={selectedDelivery!}
            />
          </div>
        )}

        {/* Navigation */}
        {currentStep !== "confirmation" && (
          <div className="flex justify-end">
            <Button
              onClick={goToNextStep}
              disabled={!canProceed()}
              size="lg"
              className="px-8"
            >
              Продовжити
            </Button>
          </div>
        )}
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:sticky lg:top-8">
        <div className="card p-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Ваше замовлення
          </h3>

          {/* Book Info */}
          <div className="flex space-x-4">
            <div className="w-16 h-20 relative flex-shrink-0 overflow-hidden rounded-md">
              {book.cover_url ? (
                <Image
                  src={book.cover_url}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                {book.title}
              </h4>
              <p className="text-sm text-gray-500 mt-1">{book.author}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Hash className="h-3 w-3" />
                  {book.code}
                </span>
                {book.category_id && (
                  <Badge variant="secondary" className="text-xs">
                    {book.category_id}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Selected Plan */}
          {selectedPlan && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Тариф</span>
                <span className="text-sm font-medium">
                  {subscriptionPlans.find(p => p.id === selectedPlan)?.name}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">Вартість</span>
                <span className="text-lg font-bold text-brand-accent-light">
                  {subscriptionPlans.find(p => p.id === selectedPlan)?.price} ₴/міс
                </span>
              </div>
            </div>
          )}

          {/* Delivery Method */}
          {selectedDelivery && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Доставка</span>
                <span className="text-sm font-medium">
                  {selectedDelivery === "courier" && "Кур'єром"}
                  {selectedDelivery === "pickup" && "Самовивіз"}
                  {selectedDelivery === "post" && "Нова Пошта"}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">Вартість</span>
                <span className="text-sm font-medium text-green-600">
                  Безкоштовно
                </span>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Що входить в підписку:
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center text-xs text-gray-600">
                <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                Безкоштовна доставка
              </li>
              <li className="flex items-center text-xs text-gray-600">
                <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                Можна змінювати книги
              </li>
              <li className="flex items-center text-xs text-gray-600">
                <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                Скасування в будь-який час
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}