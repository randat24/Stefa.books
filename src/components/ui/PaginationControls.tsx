'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  // Создаем массив номеров страниц для отображения
  const getVisiblePages = () => {
    const delta = 2; // Количество страниц вокруг текущей
    const pages: (number | string)[] = [];
    
    // Всегда показываем первую страницу
    if (currentPage > delta + 2) {
      pages.push(1);
      if (currentPage > delta + 3) {
        pages.push('...');
      }
    }
    
    // Показываем страницы вокруг текущей
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Всегда показываем последнюю страницу
    if (currentPage < totalPages - delta - 1) {
      if (currentPage < totalPages - delta - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      {/* Кнопка "Назад" */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center px-3 py-2 text-body-sm font-medium text-neutral-700 bg-neutral-0 border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-neutral-0"
        aria-label="Попередня сторінка"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Назад
      </button>

      {/* Номера страниц */}
      <div className="flex items-center space-x-1">
        {visiblePages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center w-10 h-10 text-neutral-500"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            );
          }

          const pageNumber = page as number;
          const isActive = pageNumber === currentPage;

          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`flex items-center justify-center w-10 h-10 text-body-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'text-neutral-0 bg-accent hover:bg-accent-dark'
                  : 'text-neutral-700 bg-neutral-0 border border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
              aria-label={`Сторінка ${pageNumber}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      {/* Кнопка "Вперед" */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center px-3 py-2 text-body-sm font-medium text-neutral-700 bg-neutral-0 border border-neutral-300 rounded-lg hover:bg-neutral-50 hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-neutral-0"
        aria-label="Наступна сторінка"
      >
        Вперед
        <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  );
}

// Вспомогательная функция для вычисления общего количества страниц
export function calculateTotalPages(totalItems: number, itemsPerPage: number): number {
  return Math.ceil(totalItems / itemsPerPage);
}

// Вспомогательная функция для получения элементов для текущей страницы
export function getPaginatedItems<T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number
): T[] {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
}

// Компонент информации о пагинации
interface PaginationInfoProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  className?: string;
}

export function PaginationInfo({
  currentPage,
  itemsPerPage,
  totalItems,
  className = ''
}: PaginationInfoProps) {
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`text-body-sm text-neutral-600 ${className}`}>
      Показано <span className="font-medium text-neutral-900">{startIndex}-{endIndex}</span> з{' '}
      <span className="font-medium text-neutral-900">{totalItems}</span> книг
    </div>
  );
}