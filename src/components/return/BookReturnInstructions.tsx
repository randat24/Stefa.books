import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Package, CheckCircle, AlertTriangle } from 'lucide-react';

export function BookReturnInstructions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Інструкції по поверненню
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Return Methods */}
        <div>
          <h4 className="font-semibold text-neutral-900 mb-3">Способи повернення</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border border-neutral-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-neutral-900">Самовивіз в бібліотеку</span>
              </div>
              <p className="text-body-sm text-neutral-600 mb-2">
                Принесіть книгу безпосередньо в нашу бібліотеку
              </p>
              <div className="text-caption text-neutral-500">
                <strong>Адреса:</strong> вул. Книжкова, 1, Київ<br />
                <strong>Графік роботи:</strong> Пн-Пт 9:00-18:00, Сб 10:00-16:00
              </div>
            </div>

            <div className="p-4 border border-neutral-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-green-600" />
                <span className="font-medium text-neutral-900">Кур&apos;єрська доставка</span>
              </div>
              <p className="text-body-sm text-neutral-600 mb-2">
                Замовить кур&apos;єра для забрання книги
              </p>
              <div className="text-caption text-neutral-500">
                <strong>Вартість:</strong> 50₴<br />
                <strong>Час:</strong> 1-2 робочі дні
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="font-semibold text-yellow-900">Важливо!</span>
          </div>
          <ul className="space-y-1 text-body-sm text-yellow-800">
            <li>• Перевірте стан книги перед поверненням</li>
            <li>• Книга повинна бути в тому ж стані, що й при отриманні</li>
            <li>• При пошкодженні або втраті стягується штраф</li>
            <li>• Зберігайте чек до підтвердження повернення</li>
          </ul>
        </div>

        {/* Return Process */}
        <div>
          <h4 className="font-semibold text-neutral-900 mb-3">Процес повернення</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-caption font-bold text-blue-600">1</span>
              </div>
              <div>
                <p className="text-body-sm font-medium text-neutral-900">Заповніть форму повернення</p>
                <p className="text-caption text-neutral-600">Вкажіть спосіб повернення та контактні дані</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-caption font-bold text-blue-600">2</span>
              </div>
              <div>
                <p className="text-body-sm font-medium text-neutral-900">Підтвердження заявки</p>
                <p className="text-caption text-neutral-600">Ми зв&apos;яжемося з вами для підтвердження деталей</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-caption font-bold text-blue-600">3</span>
              </div>
              <div>
                <p className="text-body-sm font-medium text-neutral-900">Повернення книги</p>
                <p className="text-caption text-neutral-600">Принесіть або відправте книгу згідно з обраним способом</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <p className="text-body-sm font-medium text-neutral-900">Підтвердження повернення</p>
                <p className="text-caption text-neutral-600">Отримайте підтвердження про успішне повернення</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-neutral-50 p-4 rounded-lg">
          <h4 className="font-semibold text-neutral-900 mb-2">Контакти</h4>
          <div className="text-body-sm text-neutral-600 space-y-1">
            <p><strong>Телефон:</strong> +380 (44) 123-45-67</p>
            <p><strong>Email:</strong> returns@stefa-books.com.ua</p>
            <p><strong>Графік роботи:</strong> Пн-Пт 9:00-18:00, Сб 10:00-16:00</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
