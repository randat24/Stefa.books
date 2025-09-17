'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { HeaderSearch } from '@/components/search/HeaderSearch';
import { AuthModal } from '@/components/auth/AuthModal';
import { AdminStatus } from '@/components/auth/AdminStatus';
import SubscribeModal from '@/components/SubscribeModal';
import CacheClearButton from '@/components/ui/CacheClearButton';
import { Button } from '@/components/ui/button';
import { User, Heart, BookOpen, Menu, X } from 'lucide-react';
// Animation components removed for build fix

export function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get auth state directly from useAuth hook
  const { isAuthenticated } = useAuth();

  return (
    <>
      <header className="header">
        <div className="header-content max-w-7xl flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="logo gap-2 sm:gap-3">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10">
              <Image
                src="/logo.svg"
                alt="Stefa.books logo"
                width={35}
                height={36}
                priority
                className="sm:w-10 sm:h-10"
              />
            </div>
            <span className="logo-text text-base sm:text-lg">Stefa.books</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <HeaderSearch />
            <Link href="/" className="px-3 py-2 text-body-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition">
              Головна
            </Link>
            <Link href="/books" className="px-3 py-2 text-body-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition">
              Каталог
            </Link>
            
            {/* Кнопка очистки кеша (только в development) */}
            {process.env.NODE_ENV === 'development' && (
              <CacheClearButton />
            )}
            
            {isAuthenticated ? (
              <>
                <Link href="/my-rentals" className="px-3 py-2 text-body-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition">
                  Мої оренди
                </Link>
                <Link href="/favorites" className="px-3 py-2 text-body-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition">
                  <Heart className="h-4 w-4" />
                </Link>
                <AdminStatus />
                <div className="flex items-center gap-2 ml-2">
                  <Button 
                    variant="outline" 
                    size="md"
                    asChild
                    className="text-neutral-700 hover:text-neutral-900"
                  >
                    <Link href="/profile">
                      <User className="h-4 w-4" />
                      <span className="ml-1">Мій профіль</span>
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Button 
                  variant="outline" 
                  size="md"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-neutral-700 hover:text-neutral-900"
                >
                  <User className="h-4 w-4" />
                  <span className="ml-1">Увійти</span>
                </Button>
                <Button 
                  size="md"
                  onClick={() => setIsSubscriptionModalOpen(true)}
                  className="bg-brand text-neutral-900 hover:bg-brand/90"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="ml-1">Підписка</span>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            {isAuthenticated && (
              <div className="flex items-center gap-1">
                <AdminStatus />
                <Link href="/favorites" className="p-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition">
                  <Heart className="h-5 w-5" />
                </Link>
              </div>
            )}
            <Button
              variant="ghost"
              size="md"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
              data-testid="mobile-menu-button"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white" data-testid="mobile-menu">
            <div className="container mx-auto px-4 max-w-7xl py-4 space-y-3">
              <HeaderSearch />
              
              <div className="flex flex-col space-y-2">
                <Link 
                  href="/" 
                  className="px-3 py-2 text-body font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Головна
                </Link>
                <Link 
                  href="/books" 
                  className="px-3 py-2 text-body font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Каталог
                </Link>
                
                {isAuthenticated ? (
                  <>
                    <Link 
                      href="/my-rentals" 
                      className="px-3 py-2 text-body font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Мої оренди
                    </Link>
                    
                    <div className="pt-2 border-t border-neutral-200">
                      <Button 
                        variant="outline" 
                        size="md"
                        asChild
                        className="w-full text-neutral-700 hover:text-neutral-900"
                      >
                        <Link 
                          href="/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Мій профіль
                        </Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="pt-2 border-t border-neutral-200 space-y-2">
                    <Button 
                      variant="outline" 
                      size="md"
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-neutral-700 hover:text-neutral-900"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Увійти
                    </Button>
                    <Button 
                      size="md"
                      onClick={() => {
                        setIsSubscriptionModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-brand text-neutral-900 hover:bg-brand/90"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Підписка
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      
      <SubscribeModal 
        isOpen={isSubscriptionModalOpen} 
        onClose={() => setIsSubscriptionModalOpen(false)} 
      />
    </>
  );
}
