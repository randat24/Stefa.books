'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  onVisibleRangeChange?: (start: number, end: number) => void;
}

/**
 * Виртуализированный список для больших наборов данных
 */
export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = '',
  overscan = 5,
  onScroll,
  onVisibleRangeChange
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Вычисляем видимый диапазон
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    
    return {
      start: Math.max(0, start - overscan),
      end
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Получаем видимые элементы
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange.start, visibleRange.end]);

  // Обработка скролла
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Уведомляем о изменении видимого диапазона
  useEffect(() => {
    onVisibleRangeChange?.(visibleRange.start, visibleRange.end);
  }, [visibleRange.start, visibleRange.end, onVisibleRangeChange]);

  // Общая высота списка
  const totalHeight = items.length * itemHeight;

  // Смещение для видимых элементов
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.start + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Виртуализированная сетка
 */
interface VirtualizedGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
}

export function VirtualizedGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  className = '',
  overscan = 5,
  onScroll
}: VirtualizedGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Вычисляем количество колонок
  const columnsPerRow = Math.floor(containerWidth / itemWidth);
  const totalRows = Math.ceil(items.length / columnsPerRow);

  // Вычисляем видимый диапазон
  const visibleRange = useMemo(() => {
    const startRow = Math.floor(scrollTop / itemHeight);
    const endRow = Math.min(
      startRow + Math.ceil(containerHeight / itemHeight) + overscan,
      totalRows
    );
    
    const startCol = Math.floor(scrollLeft / itemWidth);
    const endCol = Math.min(
      startCol + Math.ceil(containerWidth / itemWidth) + overscan,
      columnsPerRow
    );
    
    return {
      startRow: Math.max(0, startRow - overscan),
      endRow,
      startCol: Math.max(0, startCol - overscan),
      endCol
    };
  }, [scrollTop, scrollLeft, itemHeight, itemWidth, containerHeight, containerWidth, overscan, totalRows, columnsPerRow]);

  // Получаем видимые элементы
  const visibleItems = useMemo(() => {
    const visibleItemsList: Array<{ item: T; index: number; row: number; col: number }> = [];
    
    for (let row = visibleRange.startRow; row < visibleRange.endRow; row++) {
      for (let col = visibleRange.startCol; col < visibleRange.endCol; col++) {
        const index = row * columnsPerRow + col;
        if (index < items.length) {
          visibleItemsList.push({
            item: items[index],
            index,
            row,
            col
          });
        }
      }
    }
    
    return visibleItemsList;
  }, [items, visibleRange, columnsPerRow]);

  // Обработка скролла
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    const newScrollLeft = e.currentTarget.scrollLeft;
    setScrollTop(newScrollTop);
    setScrollLeft(newScrollLeft);
    onScroll?.(newScrollTop, newScrollLeft);
  }, [onScroll]);

  // Общие размеры
  const totalWidth = columnsPerRow * itemWidth;
  const totalHeight = totalRows * itemHeight;

  // Смещение для видимых элементов
  const offsetX = visibleRange.startCol * itemWidth;
  const offsetY = visibleRange.startRow * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ width: containerWidth, height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ width: totalWidth, height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translate(${offsetX}px, ${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          {visibleItems.map(({ item, index, row, col }) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: col * itemWidth,
                top: row * itemHeight,
                width: itemWidth,
                height: itemHeight
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Хук для виртуализации
 */
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    
    return {
      start: Math.max(0, start - overscan),
      end
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange.start, visibleRange.end]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    visibleRange,
    setScrollTop
  };
}

/**
 * Компонент для бесконечной прокрутки
 */
interface InfiniteScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  className?: string;
  threshold?: number;
}

export function InfiniteScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  onLoadMore,
  hasMore,
  isLoading,
  className = '',
  threshold = 100
}: InfiniteScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Проверяем, нужно ли загружать больше элементов
  const checkLoadMore = useCallback(() => {
    if (!hasMore || isLoading) return;

    const scrollHeight = containerRef.current?.scrollHeight || 0;
    const clientHeight = containerRef.current?.clientHeight || 0;
    const scrollTop = containerRef.current?.scrollTop || 0;

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore, threshold]);

  // Обработка скролла
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
    checkLoadMore();
  }, [checkLoadMore]);

  // Вычисляем видимый диапазон
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 10,
      items.length
    );
    
    return {
      start: Math.max(0, start - 5),
      end
    };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange.start, visibleRange.end]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.start + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
      
      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-brand-yellow rounded-2xl animate-spin" />
        </div>
      )}
    </div>
  );
}
