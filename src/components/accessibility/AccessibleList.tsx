'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface AccessibleListProps {
  items: Array<{
    id: string;
    label: string;
    description?: string;
    href?: string;
    onClick?: () => void;
    children?: Array<{
      id: string;
      label: string;
      description?: string;
      href?: string;
      onClick?: () => void;
    }>;
  }>;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
  role?: 'list' | 'menubar' | 'tablist' | 'tree';
  ariaLabel?: string;
  onItemSelect?: (item: any) => void;
}

/**
 * Доступный список с поддержкой клавиатуры и screen readers
 */
export function AccessibleList({
  items,
  className = '',
  orientation = 'vertical',
  role = 'list',
  ariaLabel,
  onItemSelect
}: AccessibleListProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const listRef = useRef<HTMLUListElement | null | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const item = items[index];
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (item.children && item.children.length > 0) {
          toggleExpanded(item.id);
        } else {
          handleItemClick(item);
        }
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(Math.min(index + 1, items.length - 1));
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(Math.max(index - 1, 0));
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        if (item.children && item.children.length > 0 && !expandedItems.has(item.id)) {
          setExpandedItems(prev => new Set(prev).add(item.id));
        }
        break;
        
      case 'ArrowLeft':
        e.preventDefault();
        if (item.children && item.children.length > 0 && expandedItems.has(item.id)) {
          setExpandedItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(item.id);
            return newSet;
          });
        }
        break;
        
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
        
      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleItemClick = (item: any) => {
    if (item.onClick) {
      item.onClick();
    }
    if (item.href) {
      window.location.href = item.href;
    }
    onItemSelect?.(item);
  };

  const handleItemFocus = (index: number) => {
    setFocusedIndex(index);
  };

  return (
    <ul
      ref={listRef}
      role={role}
      aria-label={ariaLabel}
      className={`
        ${orientation === 'horizontal' ? 'flex flex-row' : 'flex flex-col'}
        space-y-1
        ${className}
      `}
    >
      {items.map((item, index) => (
        <li key={item.id} className="relative">
          <div
            tabIndex={0}
            onKeyDown={(e: React.ChangeEvent<HTMLInputElement>) => handleKeyDown(e, index)}
            onFocus={() => handleItemFocus(index)}
            className={`
              flex items-center justify-between p-3 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
              hover:bg-neutral-50 transition-colors cursor-pointer
              ${focusedIndex === index ? 'bg-neutral-50' : ''}
            `}
            onClick={() => handleItemClick(item)}
            role={role === 'menubar' ? 'menuitem' : role === 'tablist' ? 'tab' : 'listitem'}
            aria-expanded={item.children ? expandedItems.has(item.id) : undefined}
            aria-current={focusedIndex === index ? 'true' : undefined}
          >
            <div className="flex-1">
              <div className="font-medium text-neutral-900">{item.label}</div>
              {item.description && (
                <div className="text-body-sm text-neutral-600 mt-1">{item.description}</div>
              )}
            </div>
            
            {item.children && item.children.length > 0 && (
              <div className="ml-2">
                {expandedItems.has(item.id) ? (
                  <ChevronDown className="w-4 h-4 text-neutral-400" aria-hidden="true" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-neutral-400" aria-hidden="true" />
                )}
              </div>
            )}
          </div>
          
          {/* Подэлементы */}
          {item.children && item.children.length > 0 && expandedItems.has(item.id) && (
            <ul
              className="ml-4 mt-1 space-y-1"
              role="group"
              aria-label={`Підменю для ${item.label}`}
            >
              {item.children.map((child) => (
                <li key={child.id}>
                  <div
                    tabIndex={0}
                    className="
                      flex items-center p-2 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
                      hover:bg-neutral-50 transition-colors cursor-pointer
                    "
                    onClick={() => handleItemClick(child)}
                    role="menuitem"
                  >
                    <div className="flex-1">
                      <div className="text-body-sm font-medium text-neutral-900">{child.label}</div>
                      {child.description && (
                        <div className="text-caption text-neutral-600 mt-1">{child.description}</div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Компонент для хлебных крошек
 */
interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
  className?: string;
  separator?: React.ReactNode;
}

export function Breadcrumb({
  items,
  className = '',
  separator = <ChevronRight className="w-4 h-4 text-neutral-400" />
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Хлібні крихти"
      className={className}
    >
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2" aria-hidden="true">
                {separator}
              </span>
            )}
            
            {item.current ? (
              <span
                className="text-body-sm font-medium text-neutral-900"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="text-body-sm text-neutral-600 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded"
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Компонент для пагинации
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showFirstLast = true,
  maxVisiblePages = 5
}: PaginationProps) {
  const getVisiblePages = () => {
    const pages: number[] = [];
    const half = Math.floor(maxVisiblePages / 2);
    
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);
    
    if (end - start + 1 < maxVisiblePages) {
      if (start === 1) {
        end = Math.min(totalPages, start + maxVisiblePages - 1);
      } else {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav
      aria-label="Пагінація"
      className={className}
    >
      <ul className="flex items-center space-x-1">
        {/* Первая страница */}
        {showFirstLast && currentPage > 1 && (
          <li>
            <button
              onClick={() => onPageChange(1)}
              className="
                px-3 py-2 text-body-sm text-neutral-600 hover:text-neutral-900
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
                rounded-lg transition-colors
              "
              aria-label="Перша сторінка"
            >
              «
            </button>
          </li>
        )}
        
        {/* Предыдущая страница */}
        {currentPage > 1 && (
          <li>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              className="
                px-3 py-2 text-body-sm text-neutral-600 hover:text-neutral-900
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
                rounded-lg transition-colors
              "
              aria-label="Попередня сторінка"
            >
              ‹
            </button>
          </li>
        )}
        
        {/* Номера страниц */}
        {visiblePages.map((page) => (
          <li key={page}>
            <button
              onClick={() => onPageChange(page)}
              className={`
                px-3 py-2 text-body-sm rounded-lg transition-colors
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
                ${page === currentPage
                  ? 'bg-accent text-brand font-medium'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }
              `}
              aria-label={`Сторінка ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          </li>
        ))}
        
        {/* Следующая страница */}
        {currentPage < totalPages && (
          <li>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              className="
                px-3 py-2 text-body-sm text-neutral-600 hover:text-neutral-900
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
                rounded-lg transition-colors
              "
              aria-label="Наступна сторінка"
            >
              ›
            </button>
          </li>
        )}
        
        {/* Последняя страница */}
        {showFirstLast && currentPage < totalPages && (
          <li>
            <button
              onClick={() => onPageChange(totalPages)}
              className="
                px-3 py-2 text-body-sm text-neutral-600 hover:text-neutral-900
                focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
                rounded-lg transition-colors
              "
              aria-label="Остання сторінка"
            >
              »
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
