import { Calendar, MapPin, Clock, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Book } from '@/lib/supabase';

interface BookRentalPricingProps {
  book: Book;
}

const RENTAL_PLANS = [
  {
    id: 'basic',
    name: 'Базова оренда',
    duration: '7 днів',
    price: 50,
    description: 'Стандартна оренда на тиждень',
    features: ['Доставка по Києву', 'Самовивіз з бібліотеки', 'Повернення в бібліотеку']
  },
  {
    id: 'extended',
    name: 'Розширена оренда',
    duration: '14 днів',
    price: 80,
    description: 'Оренда на два тижні зі знижкою',
    features: ['Доставка по Україні', 'Самовивіз з бібліотеки', 'Повернення в бібліотеку', 'Знижка 20%'],
    popular: true
  },
  {
    id: 'premium',
    name: 'Преміум оренда',
    duration: '30 днів',
    price: 120,
    description: 'Місячна оренда з максимальними перевагами',
    features: ['Доставка по Україні', 'Самовивіз з бібліотеки', 'Повернення в бібліотеку', 'Знижка 40%', 'Пріоритетна підтримка'],
    premium: true
  }
];

export function BookRentalPricing({ book }: BookRentalPricingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Тарифи оренди
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          {RENTAL_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-4 rounded-lg border-2 transition-all ${
                plan.popular
                  ? 'border-brand-accent bg-brand-accent/5'
                  : plan.premium
                  ? 'border-purple-200 bg-purple-50'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-brand-accent text-neutral-0">
                  Популярний
                </Badge>
              )}
              {plan.premium && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600 text-neutral-0">
                  Преміум
                </Badge>
              )}
              
              <div className="text-center mb-4">
                <h3 className="font-semibold text-neutral-900 mb-1">{plan.name}</h3>
                <p className="text-body-sm text-neutral-600 mb-2">{plan.description}</p>
                <div className="text-h2 text-neutral-900">
                  {plan.price} ₴
                </div>
                <div className="text-body-sm text-neutral-500">{plan.duration}</div>
              </div>

              <ul className="space-y-2 text-sm">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-2xl flex-shrink-0" />
                    <span className="text-neutral-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
          <h4 className="font-semibold text-neutral-900 mb-3">Додаткова інформація</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-neutral-400" />
              <span className="text-neutral-600">Доставка:</span>
              <span className="text-neutral-900">Безкоштовно по Києву, 30₴ по Україні</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-400" />
              <span className="text-neutral-600">Час доставки:</span>
              <span className="text-neutral-900">1-2 робочі дні</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-neutral-400" />
              <span className="text-neutral-600">Повернення:</span>
              <span className="text-neutral-900">В будь-який день до закінчення терміну</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-neutral-400" />
              <span className="text-neutral-600">Оплата:</span>
              <span className="text-neutral-900">Картка, готівка, наложений платіж</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
