import { Mail, Phone, MapPin, BookOpen, Users } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <div className="container py-12 lg:py-16">
        <div className="grid gap-8 lg:gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Про компанію */}
          <section className="space-y-4 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-100 grid place-items-center">
                <Image 
                  src="/logo.svg" 
                  alt="Stefa.books logo" 
                  width={36} 
                  height={36}
                  className="text-slate-700"
                />
              </div>
              <h3 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                Stefa.books
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-muted max-w-xs">
              Книжкова підписка у Миколаєві. Читай більше — плати менше. 
              Відкривай нові світи разом з нами!
            </p>
            <div className="space-y-3 text-sm">
              <div className="space-y-1">
                <p className="font-medium" style={{ color: 'var(--ink)' }}>Федорова Анастасія</p>
                <p className="text-muted">РНОКПП: 1234567890</p>
              </div>
              <div className="inline-flex items-center gap-2 text-muted">
                <MapPin size={14} />
                вул. Маріупольська 13/2, Миколаїв
              </div>
            </div>
          </section>

          {/* Навігація */}
          <nav className="space-y-4">
            <h4 className="font-semibold" style={{ color: 'var(--ink)' }}>Навігація</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-sm transition-colors hover:text-[var(--accent)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Головна
                </Link>
              </li>
              <li>
                <Link 
                  href="/books" 
                  className="text-sm transition-colors hover:text-[var(--accent)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Каталог книг
                </Link>
              </li>
              <li>
                <Link 
                  href="/my-rentals" 
                  className="text-sm transition-colors hover:text-[var(--accent)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Мої оренди
                </Link>
              </li>
              <li>
                <a 
                  href="/subscribe" 
                  className="text-sm transition-colors hover:text-[var(--accent)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Оформити підписку
                </a>
              </li>
            </ul>
          </nav>

          {/* Послуги */}
          <nav className="space-y-4">
            <h4 className="font-semibold" style={{ color: 'var(--ink)' }}>Послуги</h4>
            <ul className="space-y-2">
              <li className="inline-flex items-center gap-2 text-sm text-muted">
                <MapPin size={14} />
                Самовивіз з кафе
              </li>
              <li className="inline-flex items-center gap-2 text-sm text-muted">
                <BookOpen size={14} />
                Оренда книг за підпискою
              </li>
              <li className="inline-flex items-center gap-2 text-sm text-muted">
                <Users size={14} />
                Корпоративні підписки
              </li>
            </ul>
          </nav>

          {/* Контакти */}
          <section className="space-y-4">
            <h4 className="font-semibold" style={{ color: 'var(--ink)' }}>Контакти</h4>
            <div className="space-y-3">
              <p className="text-sm text-muted">
                Адреса кафе:
              </p>
              <div className="text-sm space-y-1">
                <a 
                  href="https://maps.google.com/?q=вул. Маріупольська 13/2, Миколаїв, Україна" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block hover:text-[var(--accent)] transition-colors"
                >
                  <p className="font-medium" style={{ color: 'var(--ink)' }}>вул. Маріупольська 13/2</p>
                  <p className="text-muted">Миколаїв, Україна</p>
                </a>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-muted">Зв&rsquo;язок з нами:</p>
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  <a href="mailto:info@stefa.books" className="hover:text-[var(--accent)] transition-colors">info@stefa.books</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  <a href="tel:+380638565414" className="hover:text-[var(--accent)] transition-colors">+38 (063) 856-54-14</a>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        {/* Нижня частина */}
        <div 
          className="mt-8 lg:mt-12 pt-6 lg:pt-8 border-t text-center lg:text-left"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <p className="text-xs" style={{ color: 'var(--text-light)' }}>
              © 2025 Stefa.books. Усі права захищені.
            </p>
            <nav className="flex flex-wrap justify-center lg:justify-end gap-4 lg:gap-6">
              <a 
                href="/privacy" 
                className="text-xs transition-colors hover:text-[var(--accent)]"
                style={{ color: 'var(--text-light)' }}
              >
                Політика конфіденційності
              </a>
              <a 
                href="/terms" 
                className="text-xs transition-colors hover:text-[var(--accent)]"
                style={{ color: 'var(--text-light)' }}
              >
                Умови використання
              </a>
              <a 
                href="/support" 
                className="text-xs transition-colors hover:text-[var(--accent)]"
                style={{ color: 'var(--text-light)' }}
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
