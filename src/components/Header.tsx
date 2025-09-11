import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, User, Heart } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--surface)]/80 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/70" role="banner">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3" aria-label="Stefa.books - головна сторінка">
            <div className="h-8 w-8 rounded-xl ring-1 ring-black/5 overflow-hidden">
              {/* Логотип без фона - прозрачный */}
              <div className="h-full w-full bg-transparent flex items-center justify-center">
                <div className="text-2xl">📚</div>
              </div>
            </div>
            <div>
              <div className="text-lg font-bold">Stefa.books</div>
              <div className="text-xs text-neutral-600">Дитяча бібліотека</div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6" role="navigation" aria-label="Основна навігація">
            <Link href="/catalog" className="text-[var(--text)] hover:text-[var(--accent)] transition-colors">
              Каталог
            </Link>
            <Link href="/plans" className="text-[var(--text)] hover:text-[var(--accent)] transition-colors">
              Плани
            </Link>
            <Link href="/about" className="text-[var(--text)] hover:text-[var(--accent)] transition-colors">
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