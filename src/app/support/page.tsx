import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageCircle, 
  HelpCircle,
  BookOpen,
  Users,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Підтримка | Stefa.books',
  description: 'Отримайте допомогу з підпискою, орендою книг та використанням сервісу Stefa.books',
  keywords: 'підтримка, допомога, Stefa.books, контакти, FAQ',
};

const faqData = [
  {
    category: 'Підписка',
    icon: CreditCard,
    questions: [
      {
        question: 'Як оформити підписку?',
        answer: 'Перейдіть на сторінку "Оформити підписку", оберіть тариф (Mini або Maxi) та заповніть форму. Після оплати ваша підписка буде активна.'
      },
      {
        question: 'Які тарифи доступні?',
        answer: 'Mini план: 300₴/місяць - 1 книга за раз. Maxi план: 500₴/місяць - до 2 книг за раз.'
      },
      {
        question: 'Як скасувати підписку?',
        answer: 'Зверніться до нашої служби підтримки за 3 дні до наступного списання коштів. Скасування можливе через телефон або email.'
      }
    ]
  },
  {
    category: 'Оренда книг',
    icon: BookOpen,
    questions: [
      {
        question: 'Як орендувати книгу?',
        answer: 'Оберіть книгу в каталозі, натисніть "Орендувати" та заповніть форму. Заберіть книгу в пункті самовивозу за адресою вул. Маріупольська 13/2.'
      },
      {
        question: 'На скільки можна орендувати книгу?',
        answer: 'Книгу можна орендувати на місяць. Після закінчення терміну можна продовжити оренду або обміняти на іншу книгу.'
      },
      {
        question: 'Що робити, якщо книга пошкоджена?',
        answer: 'Зверніться до нас негайно. Ми оцінимо пошкодження та вирішимо питання індивідуально.'
      }
    ]
  },
  {
    category: 'Самовивіз',
    icon: MapPin,
    questions: [
      {
        question: 'Де знаходиться пункт самовивозу?',
        answer: 'Наш пункт самовивозу знаходиться за адресою: м. Миколаїв, вул. Маріупольська 13/2.'
      },
      {
        question: 'Який графік роботи?',
        answer: 'Пн-Пт: 9:00-18:00, Сб: 10:00-16:00, Нд: вихідний.'
      },
      {
        question: 'Чи потрібно попередньо дзвонити?',
        answer: 'Так, рекомендуємо зателефонувати перед візитом для підтвердження наявності книг.'
      }
    ]
  },
  {
    category: 'Технічні питання',
    icon: HelpCircle,
    questions: [
      {
        question: 'Не завантажуються зображення книг',
        answer: 'Спробуйте оновити сторінку або очистити кеш браузера. Якщо проблема залишається, зверніться до підтримки.'
      },
      {
        question: 'Не працює кнопка "Орендувати"',
        answer: 'Перевірте, чи у вас активна підписка. Якщо підписка активна, а кнопка не працює, зверніться до підтримки.'
      },
      {
        question: 'Забув пароль від акаунту',
        answer: 'Натисніть "Забули пароль?" на сторінці входу та слідуйте інструкціям для відновлення.'
      }
    ]
  }
];

const contactMethods = [
  {
    icon: Phone,
    title: 'Телефон',
    value: '+38 (063) 856-54-14',
    description: 'Пн-Пт 9:00-18:00, Сб 10:00-16:00',
    href: 'tel:+380638565414'
  },
  {
    icon: Mail,
    title: 'Email',
    value: 'info@stefa.books',
    description: 'Відповідаємо протягом 24 годин',
    href: 'mailto:info@stefa.books'
  },
  {
    icon: MapPin,
    title: 'Адреса',
    value: 'вул. Маріупольська 13/2, Миколаїв',
    description: 'Пункт самовивозу',
    href: 'https://maps.google.com/?q=вул. Маріупольська 13/2, Миколаїв'
  }
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            Підтримка
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Ми завжди готові допомогти вам з будь-якими питаннями щодо підписки та оренди книг
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-accent rounded-2xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-neutral-900" />
                  </div>
                  <CardTitle className="text-lg">{method.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <a 
                    href={method.href}
                    className="text-accent font-semibold text-lg hover:underline"
                  >
                    {method.value}
                  </a>
                  <p className="text-neutral-600 text-sm mt-2">{method.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-8">
            Часті питання
          </h2>
          
          {faqData.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <div key={categoryIndex} className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-neutral-900" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900">
                    {category.category}
                  </h3>
                </div>
                
                <div className="grid gap-4">
                  {category.questions.map((faq, faqIndex) => (
                    <Card key={faqIndex} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg text-neutral-900">
                          {faq.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-neutral-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-16 bg-accent rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-neutral-900 mb-4">
            Не знайшли відповідь?
          </h3>
          <p className="text-neutral-700 mb-6">
            Зверніться до нашої служби підтримки, і ми допоможемо вам
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="outline" className="bg-white hover:bg-neutral-50">
              <a href="tel:+380638565414">
                <Phone className="w-5 h-5 mr-2" />
                Зателефонувати
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white hover:bg-neutral-50">
              <a href="mailto:info@stefa.books">
                <Mail className="w-5 h-5 mr-2" />
                Написати email
              </a>
            </Button>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                Як почати користуватися
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-neutral-600">
                <li>1. Оформіть підписку на сайті</li>
                <li>2. Оберіть книгу в каталозі</li>
                <li>3. Натисніть "Орендувати"</li>
                <li>4. Заберіть книгу в пункті самовивозу</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Корисні посилання
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/subscribe" className="block text-accent hover:underline">
                  Оформити підписку
                </Link>
                <Link href="/books" className="block text-accent hover:underline">
                  Каталог книг
                </Link>
                <Link href="/faq" className="block text-accent hover:underline">
                  Детальні FAQ
                </Link>
                <Link href="/account" className="block text-accent hover:underline">
                  Мій акаунт
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
