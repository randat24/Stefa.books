'use client';
import Link from 'next/link';
import Image from 'next/image';
import { HeaderSearch } from '@/components/search/HeaderSearch';

export function Header() {

  return (
    <>
      <header className="w-full sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-100 grid place-items-center">
              <Image 
                src="/logo.svg" 
                alt="Stefa.books logo" 
                width={28} 
                height={28}
                className="text-gray-700"
                priority
              />
            </div>
            <span className="text-2xl font-bold">Stefa.books</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <HeaderSearch />
            <Link href="/" className="px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition">
              Головна
            </Link>
            <Link href="/books" className="px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition">
              Каталог
            </Link>
            <Link href="/my-rentals" className="px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition">
              Мої оренди
            </Link>
            <Link href="/subscribe" className="ml-2 px-4 py-2 text-base font-medium bg-brand-yellow text-brand hover:bg-brand-yellow-light rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2">
              Підписка
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
