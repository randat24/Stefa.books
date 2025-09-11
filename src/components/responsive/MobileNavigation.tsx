'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useBreakpoint } from './ResponsiveContainer';

interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
  icon?: React.ReactNode;
}

interface MobileNavigationProps {
  items: NavigationItem[];
  className?: string;
  logo?: React.ReactNode;
  onItemClick?: (item: NavigationItem) => void;
}

/**
 * Мобильная навигация с выпадающим меню
 */
export function MobileNavigation({
  items,
  className = '',
  logo,
  onItemClick
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { isMobile } = useBreakpoint();
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрываем меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Закрываем меню при изменении размера экрана
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  // Блокируем скролл при открытом меню
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleExpanded = (itemLabel: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemLabel)) {
        newSet.delete(itemLabel);
      } else {
        newSet.add(itemLabel);
      }
      return newSet;
    });
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpanded(item.label);
    } else {
      onItemClick?.(item);
      setIsOpen(false);
    }
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.label);

    return (
      <div key={item.label}>
        <button
          onClick={() => handleItemClick(item)}
          className={`
            w-full flex items-center justify-between px-4 py-3 text-left
            hover:bg-neutral-50 transition-colors
            ${level > 0 ? 'pl-8' : ''}
          `}
        >
          <div className="flex items-center gap-3">
            {item.icon && (
              <span className="text-neutral-500">
                {item.icon}
              </span>
            )}
            <span className="font-medium">{item.label}</span>
          </div>
          
          {hasChildren && (
            <ChevronDown
              className={`w-4 h-4 text-neutral-400 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          )}
        </button>
        
        {hasChildren && isExpanded && (
          <div className="bg-neutral-50">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isMobile) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Кнопка меню */}
      <button
        onClick={toggleMenu}
        className="
          p-2 rounded-lg text-neutral-600 hover:text-neutral-900
          focus:outline-none focus:ring-2 focus:ring-accent
          transition-colors
        "
        aria-label="Відкрити меню"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Мобильное меню */}
      {isOpen && (
        <div
          ref={menuRef}
          className="
            fixed inset-0 z-50 bg-white
            transform transition-transform duration-300 ease-in-out
          "
        >
          {/* Заголовок */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            {logo && <div>{logo}</div>}
            <button
              onClick={toggleMenu}
              className="
                p-2 rounded-lg text-neutral-600 hover:text-neutral-900
                focus:outline-none focus:ring-2 focus:ring-accent
                transition-colors
              "
              aria-label="Закрити меню"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Навигационные элементы */}
          <nav className="py-4">
            {items.map(item => renderNavigationItem(item))}
          </nav>
        </div>
      )}
    </div>
  );
}

/**
 * Компонент для мобильного хедера
 */
interface MobileHeaderProps {
  logo?: React.ReactNode;
  navigation?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export function MobileHeader({
  logo,
  navigation,
  actions,
  className = '',
  sticky = true
}: MobileHeaderProps) {
  const { isMobile } = useBreakpoint();

  if (!isMobile) {
    return null;
  }

  return (
    <header
      className={`
        bg-white border-b border-neutral-200 px-4 py-3
        ${sticky ? 'sticky top-0 z-40' : ''}
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        {logo && <div className="flex-shrink-0">{logo}</div>}
        
        <div className="flex items-center gap-3">
          {actions && <div className="flex items-center gap-2">{actions}</div>}
          {navigation && <div>{navigation}</div>}
        </div>
      </div>
    </header>
  );
}

/**
 * Компонент для мобильного футера
 */
interface MobileFooterProps {
  children: React.ReactNode;
  className?: string;
  fixed?: boolean;
}

export function MobileFooter({
  children,
  className = '',
  fixed = false
}: MobileFooterProps) {
  const { isMobile } = useBreakpoint();

  if (!isMobile) {
    return null;
  }

  return (
    <footer
      className={`
        bg-white border-t border-neutral-200 px-4 py-3
        ${fixed ? 'fixed bottom-0 left-0 right-0 z-40' : ''}
        ${className}
      `}
    >
      {children}
    </footer>
  );
}

/**
 * Компонент для мобильного контента
 */
interface MobileContentProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  safeArea?: boolean;
}

export function MobileContent({
  children,
  className = '',
  padding = true,
  safeArea = true
}: MobileContentProps) {
  const { isMobile } = useBreakpoint();

  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={`
        ${padding ? 'px-4 py-6' : ''}
        ${safeArea ? 'pb-safe' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * Компонент для мобильных карточек
 */
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  clickable?: boolean;
  onClick?: () => void;
}

export function MobileCard({
  children,
  className = '',
  clickable = false,
  onClick
}: MobileCardProps) {
  const { isMobile } = useBreakpoint();

  const baseClasses = `
    bg-white rounded-lg border border-neutral-200
    ${clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
  `;

  if (!isMobile) {
    return <div className={`${baseClasses} ${className}`}>{children}</div>;
  }

  return (
    <div
      className={`${baseClasses} ${className}`}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      {children}
    </div>
  );
}
