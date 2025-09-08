import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, Shield, RefreshCw } from 'lucide-react';

export function BookRentalTerms() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Умови оренди
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rental Terms */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Терміни оренди
          </h4>
          <ul className="space-y-2 text-body-sm text-gray-600">
            <li>• Оренда починається з моменту отримання книги</li>
            <li>• Можна повернути книгу раніше закінчення терміну без додаткової плати</li>
            <li>• При затримці повернення стягується штраф 10₴ за кожен день</li>
            <li>• Максимальний термін затримки - 7 днів</li>
            <li>• При втраті або пошкодженні книги стягується повна вартість книги</li>
          </ul>
        </div>

        {/* Delivery Terms */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Умови доставки
          </h4>
          <ul className="space-y-2 text-body-sm text-gray-600">
            <li>• Доставка по Києву - безкоштовно</li>
            <li>• Доставка по Україні - 30₴</li>
            <li>• Самовивіз з бібліотеки - безкоштовно</li>
            <li>• Час доставки: 1-2 робочі дні</li>
            <li>• Доставка здійснюється в робочі дні з 9:00 до 18:00</li>
            <li>• При відсутності отримувача книга залишається в найближчому відділенні</li>
          </ul>
        </div>

        {/* Payment Terms */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Умови оплати
          </h4>
          <ul className="space-y-2 text-body-sm text-gray-600">
            <li>• Оплата здійснюється при отриманні книги</li>
            <li>• Приймаються готівка, банківські картки, наложений платіж</li>
            <li>• При передоплаті надається знижка 5%</li>
            <li>• Повернення коштів при скасуванні замовлення - 100%</li>
            <li>• При поверненні книги раніше терміну - повернення пропорційної частини</li>
          </ul>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Важливо знати</h4>
          <ul className="space-y-1 text-body-sm text-blue-800">
            <li>• Книги видаються в хорошому стані</li>
            <li>• При отриманні перевірте стан книги</li>
            <li>• Зберігайте чек до повернення книги</li>
            <li>• При питаннях звертайтеся за телефоном: +380 (44) 123-45-67</li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="text-center text-body-sm text-gray-500">
          <p>Маєте питання? Зв&apos;яжіться з нами:</p>
          <p className="font-medium">📞 +380 (44) 123-45-67 | 📧 info@stefa-books.com.ua</p>
        </div>
      </CardContent>
    </Card>
  );
}
