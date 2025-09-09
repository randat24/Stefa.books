"use client";

import { Truck, MapPin, Package, Clock, CheckCircle } from "lucide-react";

type DeliveryMethod = "courier" | "pickup" | "post";

interface DeliveryOption {
  id: DeliveryMethod;
  name: string;
  description: string;
  icon: React.ReactNode;
  timeframe: string;
  price: string;
  features: string[];
}

const deliveryOptions: DeliveryOption[] = [
  {
    id: "courier",
    name: "Доставка кур'єром",
    description: "Доставимо книгу прямо до ваших дверей",
    icon: <Truck className="h-6 w-6" />,
    timeframe: "1-2 робочих дні",
    price: "Безкоштовно",
    features: [
      "Доставка за адресою",
      "Контактний дзвінок перед доставкою", 
      "Гнучкий графік доставки"
    ]
  },
  {
    id: "pickup",
    name: "Самовивіз",
    description: "Заберіть книгу в нашому пункті видачі",
    icon: <MapPin className="h-6 w-6" />,
    timeframe: "Завтра після 12:00",
    price: "Безкоштовно",
    features: [
      "м. Київ, вул. Хрещатик, 1",
      "Пн-Пт: 10:00-19:00, Сб: 10:00-16:00",
      "SMS повідомлення про готовність"
    ]
  },
  {
    id: "post",
    name: "Нова Пошта",
    description: "Відправимо на відділення Нової Пошти",
    icon: <Package className="h-6 w-6" />,
    timeframe: "1-3 робочих дні",
    price: "Безкоштовно",
    features: [
      "Доставка в будь-яке місто України",
      "Більше 9000 відділень",
      "SMS повідомлення про доставку"
    ]
  }
];

interface DeliveryMethodSelectorProps {
  selected: DeliveryMethod | null;
  onSelect: (method: DeliveryMethod) => void;
}

export function DeliveryMethodSelector({ selected, onSelect }: DeliveryMethodSelectorProps) {
  return (
    <div className="space-y-4">
      {deliveryOptions.map((option) => (
        <div
          key={option.id}
          className={`card p-6 cursor-pointer transition-all hover:shadow-md ${
            selected === option.id
              ? "border-2 border-brand-accent-light bg-blue-50"
              : "border border-neutral-200 hover:border-neutral-300"
          }`}
          onClick={() => onSelect(option.id)}
        >
          <div className="flex items-start space-x-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${
              selected === option.id
                ? "bg-brand-accent-light text-neutral-0"
                : "bg-neutral-100 text-neutral-600"
            }`}>
              {option.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-body-lg font-semibold text-neutral-900">
                  {option.name}
                </h3>
                {selected === option.id && (
                  <CheckCircle className="h-6 w-6 text-brand-accent-light" />
                )}
              </div>
              
              <p className="text-neutral-600 mt-1 mb-3">
                {option.description}
              </p>

              <div className="flex items-center space-x-6 text-body-sm mb-3">
                <div className="flex items-center text-neutral-600">
                  <Clock className="h-4 w-4 mr-1" />
                  {option.timeframe}
                </div>
                <div className="text-green-600 font-medium">
                  {option.price}
                </div>
              </div>

              <ul className="space-y-1">
                {option.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-body-sm text-neutral-600">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}