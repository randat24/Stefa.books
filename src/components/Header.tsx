import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, User, Heart } from 'lucide-react';

export default function Header() {
  return (
    <header className="header" role="banner">
      <div className="header-content">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="logo" aria-label="Stefa.books - головна сторінка">
            <div className="logo-icon">
              {/* Логотип без фона - прозрачный */}
              <div className="h-full w-full bg-transparent flex items-center justify-center">
                <div className="text-2xl">📚</div>
              </div>
            </div>
            <div>
              <div className="logo-text">Stefa.books</div>
              <div className="logo-subtitle">Дитяча бібліотека</div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="header-nav" role="navigation" aria-label="Основна навігація">
            <Link href="/catalog" className="header-nav-link">
              Каталог
            </Link>
            <Link href="/plans" className="header-nav-link">
              Плани
            </Link>
            <Link href="/about" className="header-nav-link">
              Про нас
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Пошук">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Улюблені">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Профіль">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="primary" size="md">
              Увійти
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}