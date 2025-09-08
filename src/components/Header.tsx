import Link from 'next/link';

export default function Header(){
  return (
    <header 
      className='p-4 border-b backdrop-blur bg-white/70 sticky top-0 z-50'
      role="banner"
    >
      <div className="container-default flex items-center justify-between">
        <Link 
          href="/" 
          className="font-semibold text-body-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 rounded-md px-2 py-1"
          aria-label="Stefa.books - головна сторінка"
        >
          Stefa.books
        </Link>
        <nav 
          className="flex gap-2"
          role="navigation"
          aria-label="Основна навігація"
        >
          <Link 
            href="/" 
            className="px-3 py-2 rounded-2xl hover:bg-gray-100 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 transition-colors"
            aria-current="page"
          >
            Головна
          </Link>
          <Link 
            href="/books" 
            className="px-3 py-2 rounded-2xl hover:bg-gray-100 text-body-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 transition-colors"
          >
            Книги
          </Link>
        </nav>
      </div>
    </header>
  );
}
