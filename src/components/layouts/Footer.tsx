import { Mail, Phone, MapPin, BookOpen } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';
import { withDailyCacheBuster } from '@/lib/cache-buster';

export function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-neutral-50 to-white border-t border-neutral-200">
      <div className="container mx-auto px-4 max-w-7xl py-12 lg:py-16">
        <div className="grid gap-8 lg:gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Про компанію */}
          <section className="space-y-4 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl grid place-items-center">
                <Image
                  src={withDailyCacheBuster('/logo.svg')}
                  alt="Stefa.books logo"
                  width={40}
                  height={40}
                  priority
                  unoptimized={true}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Stefa.books
                </h3>
                <p className="text-sm text-neutral-600">Дитяча бібліотека</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-neutral-600 max-w-xs">
            Книгарня за підпискою  у Миколаєві. Читайте більше - платіть менше. 
            Відкривайте нові світи разом з нами!
            </p>
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <p className="font-semibold text-neutral-900">Федорова Анастасія</p>
                <p className="text-neutral-600">РНОКПП: 1234567890</p>
              </div>
            </div>
          </section>

          {/* Навігація */}
          <nav className="space-y-4">
            <h4 className="font-semibold text-neutral-900">Навігація</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-sm text-neutral-600 hover:text-[#F7C948] transition-colors"
                >
                  Головна
                </Link>
              </li>
              <li>
                <Link 
                  href="/books" 
                  className="text-sm text-neutral-600 hover:text-[#F7C948] transition-colors"
                >
                  Каталог книг
                </Link>
              </li>
              <li>
                <Link 
                  href="/my-rentals" 
                  className="text-sm text-neutral-600 hover:text-[#F7C948] transition-colors"
                >
                  Мої оренди
                </Link>
              </li>
              <li>
                <a 
                  href="/subscribe" 
                  className="text-sm text-neutral-600 hover:text-[#F7C948] transition-colors"
                >
                  Оформити підписку
                </a>
              </li>
            </ul>
          </nav>

          {/* Послуги */}
          <nav className="space-y-4">
            <h4 className="font-semibold text-neutral-900">Послуги</h4>
            <ul className="space-y-2">
              <li className="inline-flex items-center gap-2 text-sm text-neutral-600">
                <MapPin size={14} />
                Самовивіз з кафе
              </li>
              <li className="inline-flex items-center gap-2 text-sm text-neutral-600">
                <BookOpen size={14} />
                Оренда книг за підпискою
              </li>
            </ul>
          </nav>

          {/* Контакти */}
          <section className="space-y-4">
            <h4 className="font-semibold text-neutral-900">Контакти</h4>
            <div className="space-y-3">
              <p className="text-sm text-neutral-600">
                Адреса кафе:
              </p>
              <div className="text-sm space-y-1">
                <a 
                  href="https://maps.google.com/?q=вул. Маріупольська 13/2, Миколаїв, Україна" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block hover:text-[#F7C948] transition-colors"
                >
                  <p className="font-medium text-neutral-900">Адреса пункту самовивозу</p>
                  <p className="text-neutral-600">вул. Маріупольська 13/2, Миколаїв</p>
                </a>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-neutral-600">Зв&apos;язок з нами:</p>
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  <a href="mailto:info@stefa.books" className="text-neutral-600 hover:text-[#F7C948] transition-colors">info@stefa.books</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  <a href="tel:+380734085660" className="text-neutral-600 hover:text-[#F7C948] transition-colors">+38 (073) 408 56 60</a>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        {/* Нижня частина */}
        <div className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t border-neutral-200 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <p className="text-xs text-neutral-500">
              © 2025 Stefa.books. Усі права захищені.
            </p>
            <nav className="flex flex-wrap justify-center lg:justify-end gap-4 lg:gap-6">
              <a 
                href="/privacy" 
                className="text-xs text-neutral-500 hover:text-[#F7C948] transition-colors"
              >
                Політика конфіденційності
              </a>
              <a 
                href="/terms" 
                className="text-xs text-neutral-500 hover:text-[#F7C948] transition-colors"
              >
                Умови використання
              </a>
              <a 
                href="/support" 
                className="text-xs text-neutral-500 hover:text-[#F7C948] transition-colors"
              >
                Підтримка
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
