import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-neutral-100 grid place-items-center">
                <Image 
                  src="/logo.svg" 
                  alt="Stefa.books logo" 
                  width={32} 
                  height={32}
                  className="text-neutral-700"
                  unoptimized={true}
                />
              </div>
              <span className="text-h2 text-neutral-900">Stefa.books</span>
            </Link>
            <p className="text-neutral-600 text-body-sm leading-relaxed max-w-md">
              Дитяча бібліотека з орендою книг за підпискою. 
              Самовивіз з точки в Миколаєві. Розвивайте любов до читання у ваших дітей.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">Навігація</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-neutral-600 hover:text-neutral-900 text-body-sm transition">
                  Головна
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-neutral-600 hover:text-neutral-900 text-body-sm transition">
                  Каталог
                </Link>
              </li>
              <li>
                <Link href="/plans" className="text-neutral-600 hover:text-neutral-900 text-body-sm transition">
                  Тарифи
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-600 hover:text-neutral-900 text-body-sm transition">
                  Про нас
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-neutral-900 mb-4">Контакти</h3>
            <div className="space-y-3">
              <div>
                <p className="text-neutral-600 text-body-sm font-medium mb-1">Адреса:</p>
                <a 
                  href="https://maps.google.com/?q=вул. Маріупольська 13/2, Миколаїв"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-600 hover:text-neutral-900 text-body-sm transition"
                >
                  вул. Маріупольська 13/2, Миколаїв
                </a>
              </div>
              <div>
                <p className="text-neutral-600 text-body-sm font-medium mb-1">Телефон:</p>
                <a 
                  href="tel:+380638565414"
                  className="text-neutral-600 hover:text-neutral-900 text-body-sm transition"
                >
                  +38 (063) 856-54-14
                </a>
              </div>
              <div className="pt-2">
                <Link href="/contact" className="text-neutral-600 hover:text-neutral-900 text-body-sm transition">
                  Всі контакти
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-200 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-neutral-500 text-sm">
            © 2025 Stefa.books. Всі права захищені.
          </p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <span className="text-neutral-500 text-sm">Зроблено з ❤️ в Україні</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
