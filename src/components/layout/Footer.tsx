import { Mail, Phone, MapPin, BookOpen, Users, Truck } from "lucide-react";
import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <div className="container py-12 lg:py-16">
        <div className="grid gap-8 lg:gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Про компанію */}
          <section className="space-y-4 md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-neutral-100 grid place-items-center">
                <Image 
                  src="/logo.svg" 
                  alt="Stefa.books logo" 
                  width={28} 
                  height={28}
                  className="text-neutral-700"
                  unoptimized={true}
                  onError={(e: React.ChangeEvent<HTMLInputElement>) => {
                    // Fallback to a simple div with text if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.className = 'text-neutral-700 font-bold text-xs';
                      fallback.textContent = 'S';
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </div>
              <h3 className="text-h3" style={{ color: 'var(--ink)' }}>
                Stefa.books
              </h3>
            </div>
            <p className="text-body-sm leading-relaxed text-muted max-w-xs">
              Книжкова підписка у Миколаєві. Читай більше — плати менше. 
              Відкривай нові світи разом з нами!
            </p>
            <div className="flex flex-col gap-2">
              <a 
                href="mailto:info@stefa.books" 
                className="inline-flex items-center gap-2 text-body-sm hover:text-[var(--accent)] transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <Mail size={16} />
                info@stefa.books
              </a>
              <a 
                href="tel:+380501234567" 
                className="inline-flex items-center gap-2 text-body-sm hover:text-[var(--accent)] transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <Phone size={16} />
                +38 (050) 123-45-67
              </a>
              <div className="inline-flex items-center gap-2 text-body-sm text-muted">
                <MapPin size={16} />
                Миколаїв, Україна
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
                  className="text-body-sm transition-colors hover:text-[var(--accent)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Головна
                </Link>
              </li>
              <li>
                <Link 
                  href="/catalog" 
                  className="text-body-sm transition-colors hover:text-[var(--accent)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Каталог книг
                </Link>
              </li>
              <li>
                <Link 
                  href="/plans" 
                  className="text-body-sm transition-colors hover:text-[var(--accent)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Тарифи та підписки
                </Link>
              </li>
              <li>
                <Link 
                  href="/subscribe" 
                  className="text-body-sm transition-colors hover:text-[var(--accent)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Оформити підписку
                </Link>
              </li>
            </ul>
          </nav>

          {/* Послуги */}
          <nav className="space-y-4">
            <h4 className="font-semibold" style={{ color: 'var(--ink)' }}>Послуги</h4>
            <ul className="space-y-2">
              <li className="inline-flex items-center gap-2 text-body-sm text-muted">
                <Truck size={14} />
                Доставка додому
              </li>
              <li className="inline-flex items-center gap-2 text-body-sm text-muted">
                <MapPin size={14} />
                Самовивіз
              </li>
              <li className="inline-flex items-center gap-2 text-body-sm text-muted">
                <Users size={14} />
                Корпоративні підписки
              </li>
              <li className="inline-flex items-center gap-2 text-body-sm text-muted">
                <BookOpen size={14} />
                Консультації з вибору
              </li>
            </ul>
          </nav>

          {/* Підписка на новини */}
          <section className="space-y-4">
            <h4 className="font-semibold" style={{ color: 'var(--ink)' }}>Новини</h4>
            <p className="text-body-sm text-muted">
              Підпишіться на розсилку, щоб дізнаватися про нові книги першими
            </p>
            <div className="space-y-2">
              <input 
                type="email" 
                placeholder="Ваш email"
                className="input w-full text-body-sm h-10 px-3"
              />
              <button className="inline-flex items-center justify-center rounded-2xl font-semibold w-full h-10 px-4 text-body-sm bg-accent text-neutral-900 hover:bg-accent-light transition-colors shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
                Підписатися
              </button>
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
                className="text-caption transition-colors hover:text-[var(--accent)]"
                style={{ color: 'var(--text-light)' }}
              >
                Політика конфіденційності
              </a>
              <a 
                href="/terms" 
                className="text-caption transition-colors hover:text-[var(--accent)]"
                style={{ color: 'var(--text-light)' }}
              >
                Умови використання
              </a>
              <a 
                href="/support" 
                className="text-caption transition-colors hover:text-[var(--accent)]"
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