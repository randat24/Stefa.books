'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { HeaderSearch } from '@/components/search/HeaderSearch';
import { AuthModal } from '@/components/auth/AuthModal';
import { AdminStatus } from '@/components/auth/AdminStatus';
import { SubscriptionModal } from '@/components/subscribe/SubscriptionModal';
import { Button } from '@/components/ui/button';
import { User, LogOut, Heart, BookOpen, Menu, X } from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="w-full sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-100 grid place-items-center">
              <Image 
                src="/logo.svg" 
                alt="Stefa.books logo" 
                width={24} 
                height={24}
                className="text-gray-700 sm:w-7 sm:h-7"
                priority
              />
            </div>
            <span className="text-lg sm:text-2xl font-bold">Stefa.books</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <HeaderSearch />
            <Link href="/" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition">
              Головна
            </Link>
            <Link href="/books" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition">
              Каталог
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link href="/my-rentals" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition">
                  Мої оренди
                </Link>
                <Link href="/favorites" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition">
                  <Heart className="h-4 w-4" />
                </Link>
                <AdminStatus />
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm text-gray-600">
                    {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Користувач'}
                  </span>
                  <Button 
                    variant="outline" 
                    size="md" 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="ml-1">Вийти</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Button 
                  variant="outline" 
                  size="md"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <User className="h-4 w-4" />
                  <span className="ml-1">Увійти</span>
                </Button>
                <Button 
                  size="md"
                  onClick={() => setIsSubscriptionModalOpen(true)}
                  className="bg-brand-yellow text-brand hover:bg-brand-yellow-light"
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
                <Link href="/favorites" className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition">
                  <Heart className="h-5 w-5" />
                </Link>
              </div>
            )}
            <Button
              variant="ghost"
              size="md"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="container py-4 space-y-3">
              <HeaderSearch />
              
              <div className="flex flex-col space-y-2">
                <Link 
                  href="/" 
                  className="px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Головна
                </Link>
                <Link 
                  href="/books" 
                  className="px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Каталог
                </Link>
                
                {isAuthenticated ? (
                  <>
                    <Link 
                      href="/my-rentals" 
                      className="px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Мої оренди
                    </Link>
                    
                    <div className="pt-2 border-t border-gray-200">
                      <div className="px-3 py-2 text-sm text-gray-600 mb-3">
                        {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Користувач'}
                      </div>
                      <Button 
                        variant="outline" 
                        size="md" 
                        onClick={handleLogout}
                        className="w-full text-gray-600 hover:text-gray-900"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Вийти
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="pt-2 border-t border-gray-200 space-y-2">
                    <Button 
                      variant="outline" 
                      size="md"
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-gray-700 hover:text-gray-900"
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
                      className="w-full bg-brand-yellow text-brand hover:bg-brand-yellow-light"
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
      
      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen} 
        onClose={() => setIsSubscriptionModalOpen(false)} 
      />
    </>
  );
}
