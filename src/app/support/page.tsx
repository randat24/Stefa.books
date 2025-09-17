import { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
// @ts-expect-error - Lucide React icon types not properly recognized
import { HeadphonesIcon, MessageSquare, Phone, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Підтримка | Stefa.books",
  description: "Технічна підтримка та допомога користувачам Stefa.books. FAQ, контакти та корисні ресурси.",
  openGraph: {
    title: "Підтримка | Stefa.books",
    description: "Технічна підтримка та допомога користувачам Stefa.books." } };

const breadcrumbItems = [
  { label: "Головна", href: "/" },
  { label: "Підтримка", current: true }
];

const supportChannels = [
  {
    icon: Phone,
    title: "Телефонна підтримка",
    description: "Швидка допомога по телефону",
    contact: "+38 (073) 408 56 60",
    availability: "Пн-Пт: 9:00-18:00"
  },
  {
    icon: MessageSquare,
    title: "Чат підтримки",
    description: "Онлайн чат з нашими операторами",
    contact: "Натисніть кнопку 'Чат' у правому нижньому куті",
    availability: "24/7"
  },
  {
    icon: Mail,
    title: "Email підтримка",
    description: "Детальні питання та звіти про проблеми",
    contact: "support@stefa.books",
    availability: "Відповідь протягом 24 годин"
  }
];

const faqItems = [
  {
    question: "Як зареєструватися на сайті?",
    answer: "Натисніть кнопку 'Реєстрація' у верхньому правому куті, заповніть форму з вашими даними та підтвердіть email адресу."
  },
  {
    question: "Як працює підписка на книги?",
    answer: "Підписка дозволяє читати необмежену кількість книг з нашого каталогу за щомісячну плату. Ви можете читати онлайн або завантажувати для офлайн-читання."
  },
  {
    question: "Як орендувати книгу?",
    answer: "Оберіть книгу в каталозі, натисніть 'Орендувати', виберіть термін оренди та спосіб оплати. Після оплати книга стане доступною в вашому кабінеті."
  },
  {
    question: "Як скасувати підписку?",
    answer: "Зайдіть у свій кабінет, перейдіть до розділу 'Підписка' та натисніть 'Скасувати підписку'. Підписка буде активна до кінця поточного періоду."
  },
  {
    question: "Як повернути орендовану книгу?",
    answer: "У вашому кабінеті в розділі 'Мої оренди' натисніть 'Повернути' біля потрібної книги. Доступ до книги автоматично припиниться."
  },
  {
    question: "Що робити, якщо не можу увійти в акаунт?",
    answer: "Спробуйте відновити пароль через форму 'Забули пароль?'. Якщо проблема залишається, зверніться до нашої служби підтримки."
  }
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
            <HeadphonesIcon className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Центр підтримки
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ми завжди готові допомогти вам з будь-якими питаннями
          </p>
        </div>

        {/* Support Channels */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {supportChannels.map((channel, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-4">
                <channel.icon className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {channel.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {channel.description}
              </p>
              <div className="space-y-2">
                <p className="text-amber-600 font-medium">
                  {channel.contact}
                </p>
                <p className="text-sm text-gray-500">
                  {channel.availability}
                </p>
              </div>
                  </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Часті питання
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {item.question}
                  </h3>
                <p className="text-gray-600">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Корисні посилання
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/faq" className="text-amber-600 hover:text-amber-700 transition-colors">
                  → Детальні FAQ
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-amber-600 hover:text-amber-700 transition-colors">
                  → Політика конфіденційності
                </a>
              </li>
              <li>
                <a href="/terms" className="text-amber-600 hover:text-amber-700 transition-colors">
                  → Умови використання
                </a>
              </li>
              <li>
                <a href="/about" className="text-amber-600 hover:text-amber-700 transition-colors">
                  → Про нас
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Не знайшли відповідь?
          </h3>
            <p className="text-gray-600 mb-4">
              Якщо у вас залишилися питання, зв&apos;яжіться з нами будь-яким зручним способом
            </p>
            <div className="space-y-2">
              <a
                href="/contact"
                className="inline-block w-full bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors text-center"
              >
                Зв&apos;язатися з нами
              </a>
              <a
                href="tel:+380734085660"
                className="inline-block w-full border border-amber-600 text-amber-600 py-2 px-4 rounded-lg hover:bg-amber-50 transition-colors text-center"
              >
                Подзвонити
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}