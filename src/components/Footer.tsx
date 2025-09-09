import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[var(--surface-2)] border-t border-[var(--line)] mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-xl bg-[var(--brand)] ring-1 ring-black/5" />
              <div>
                <div className="h3">Stefa.Books</div>
                <div className="small">Дитяча бібліотека</div>
              </div>
            </div>
            <p className="body text-[var(--text-muted)] max-w-md">
              Орендуйте та читайте українські дитячі книги онлайн. Великий каталог українських дитячих книг для різних вікових категорій.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="h3 mb-4">Швидкі посилання</h3>
            <ul className="space-y-2">
              <li><Link href="/catalog" className="small text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">Каталог книг</Link></li>
              <li><Link href="/plans" className="small text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">Плани підписки</Link></li>
              <li><Link href="/about" className="small text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">Про нас</Link></li>
              <li><Link href="/contact" className="small text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">Контакти</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="h3 mb-4">Підтримка</h3>
            <ul className="space-y-2">
              <li><Link href="/help" className="small text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">Допомога</Link></li>
              <li><Link href="/faq" className="small text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">FAQ</Link></li>
              <li><Link href="/privacy" className="small text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">Політика конфіденційності</Link></li>
              <li><Link href="/terms" className="small text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">Умови використання</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--line)] mt-8 pt-8 text-center">
          <p className="small text-[var(--text-muted)]">
            © 2024 Stefa.Books. Всі права захищені.
          </p>
        </div>
      </div>
    </footer>
  );
}