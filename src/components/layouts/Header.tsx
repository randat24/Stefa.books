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
// Animation components removed for build fix

export function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get auth state directly from useAuth hook
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="header">
        <div className="header-content max-w-7xl flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="logo gap-2 sm:gap-3">
            <Image 
              src="/logo.svg" 
              alt="Stefa.books logo" 
              width={32}
              height={32}
              className="text-text-muted sm:w-10 sm:h-10"
            />
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
                  <span className="text-body-sm text-neutral-600">
                    {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Користувач'}
                  </span>
                  <Button 
                    variant="outline" 
                    size="md" 
                    onClick={handleLogout}
                    className="text-neutral-600 hover:text-neutral-900"
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
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white">
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
                      <div className="px-3 py-2 text-body-sm text-neutral-600 mb-3">
                        {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Користувач'}
                      </div>
                      <Button 
                        variant="outline" 
                        size="md" 
                        onClick={handleLogout}
                        className="w-full bg-[var(--brand)] text-[#111827] hover:bg-[var(--brand-600)] border-[var(--brand)]"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Вийти
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
      
      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen} 
        onClose={() => setIsSubscriptionModalOpen(false)} 
      />
    </>
  );
}
