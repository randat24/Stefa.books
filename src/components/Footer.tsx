import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gray-100 grid place-items-center">
                <Image 
                  src="/logo.svg" 
                  alt="Stefa.books logo" 
                  width={32} 
                  height={32}
                  className="text-gray-700"
                />
              </div>
              <span className="text-2xl font-bold text-gray-900">Stefa.books</span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed max-w-md">
              Дитяча бібліотека з доставкою по Україні. 
              Орендуйте книги для ваших дітей та розвивайте їхню любов до читання.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Навігація</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  Головна
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  Каталог
                </Link>
              </li>
              <li>
                <Link href="/plans" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  Тарифи
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  Про нас
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Підтримка</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  Контакти
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  Конфіденційність
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  Умови використання
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2025 Stefa.books. Всі права захищені.
          </p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <span className="text-gray-500 text-sm">Зроблено з ❤️ в Україні</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
