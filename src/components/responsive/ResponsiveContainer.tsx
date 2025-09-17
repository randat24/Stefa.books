'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  breakpoints?: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  onBreakpointChange?: (breakpoint: string) => void;
}

/**
 * Контейнер с адаптивным поведением
 */
export function ResponsiveContainer({
  children,
  className = '',
  breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  },
  onBreakpointChange
}: ResponsiveContainerProps) {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('xl');
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement | null | null>(null);

  useEffect(() => {
    setIsClient(true);
    
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      let breakpoint = 'xl';
      
      if (width < breakpoints.sm) {
        breakpoint = 'xs';
      } else if (width < breakpoints.md) {
        breakpoint = 'sm';
      } else if (width < breakpoints.lg) {
        breakpoint = 'md';
      } else if (width < breakpoints.xl) {
        breakpoint = 'lg';
      }
      
      if (breakpoint !== currentBreakpoint) {
        setCurrentBreakpoint(breakpoint);
        onBreakpointChange?.(breakpoint);
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, [breakpoints, currentBreakpoint, onBreakpointChange]);

  if (!isClient) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={className}
      data-breakpoint={currentBreakpoint}
    >
      {children}
    </div>
  );
}

/**
 * Хук для получения текущего breakpoint
 */
export function useBreakpoint(breakpoints?: {
  sm: number;
  md: number;
  lg: number;
  xl: number;
}) {
  const defaultBreakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280
  };

  const bp = breakpoints || defaultBreakpoints;
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('xl');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      let breakpoint = 'xl';
      
      if (width < bp.sm) {
        breakpoint = 'xs';
      } else if (width < bp.md) {
        breakpoint = 'sm';
      } else if (width < bp.lg) {
        breakpoint = 'md';
      } else if (width < bp.xl) {
        breakpoint = 'lg';
      }
      
      setCurrentBreakpoint(breakpoint);
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, [bp]);

  return {
    breakpoint: currentBreakpoint,
    isClient,
    isXs: currentBreakpoint === 'xs',
    isSm: currentBreakpoint === 'sm',
    isMd: currentBreakpoint === 'md',
    isLg: currentBreakpoint === 'lg',
    isXl: currentBreakpoint === 'xl',
    isMobile: currentBreakpoint === 'xs' || currentBreakpoint === 'sm',
    isTablet: currentBreakpoint === 'md',
    isDesktop: currentBreakpoint === 'lg' || currentBreakpoint === 'xl'
  };
}

/**
 * Компонент для условного рендеринга по breakpoint
 */
interface ResponsiveRenderProps {
  children: React.ReactNode;
  showOn?: string[];
  hideOn?: string[];
  className?: string;
}

export function ResponsiveRender({
  children,
  showOn = [],
  hideOn = [],
  className = ''
}: ResponsiveRenderProps) {
  const { breakpoint } = useBreakpoint();

  const shouldShow = () => {
    if (showOn.length > 0) {
      return showOn.includes(breakpoint);
    }
    if (hideOn.length > 0) {
      return !hideOn.includes(breakpoint);
    }
    return true;
  };

  if (!shouldShow()) {
    return null;
  }

  return <div className={className}>{children}</div>;
}

/**
 * Компонент для адаптивной сетки
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
}

export function ResponsiveGrid({
  children,
  className = '',
  cols = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5
  },
  gap = 'gap-4'
}: ResponsiveGridProps) {
  const { breakpoint } = useBreakpoint();

  const getGridCols = () => {
    switch (breakpoint) {
      case 'xs':
        return `grid-cols-${cols.xs || 1}`;
      case 'sm':
        return `grid-cols-${cols.sm || 2}`;
      case 'md':
        return `grid-cols-${cols.md || 3}`;
      case 'lg':
        return `grid-cols-${cols.lg || 4}`;
      case 'xl':
        return `grid-cols-${cols.xl || 5}`;
      default:
        return `grid-cols-${cols.xl || 5}`;
    }
  };

  return (
    <div className={`grid ${getGridCols()} ${gap} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Компонент для адаптивного текста
 */
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  sizes?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

export function ResponsiveText({
  children,
  className = '',
  sizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  }
}: ResponsiveTextProps) {
  const { breakpoint } = useBreakpoint();

  const getTextSize = () => {
    switch (breakpoint) {
      case 'xs':
        return sizes.xs || 'text-sm';
      case 'sm':
        return sizes.sm || 'text-base';
      case 'md':
        return sizes.md || 'text-lg';
      case 'lg':
        return sizes.lg || 'text-xl';
      case 'xl':
        return sizes.xl || 'text-2xl';
      default:
        return sizes.xl || 'text-2xl';
    }
  };

  return (
    <div className={`${getTextSize()} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Компонент для адаптивных отступов
 */
interface ResponsiveSpacingProps {
  children: React.ReactNode;
  className?: string;
  padding?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  margin?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

export function ResponsiveSpacing({
  children,
  className = '',
  padding = {
    xs: 'p-2',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  },
  margin = {}
}: ResponsiveSpacingProps) {
  const { breakpoint } = useBreakpoint();

  const getPadding = () => {
    switch (breakpoint) {
      case 'xs':
        return padding.xs || 'p-2';
      case 'sm':
        return padding.sm || 'p-4';
      case 'md':
        return padding.md || 'p-6';
      case 'lg':
        return padding.lg || 'p-8';
      case 'xl':
        return padding.xl || 'p-10';
      default:
        return padding.xl || 'p-10';
    }
  };

  const getMargin = () => {
    switch (breakpoint) {
      case 'xs':
        return margin.xs || '';
      case 'sm':
        return margin.sm || '';
      case 'md':
        return margin.md || '';
      case 'lg':
        return margin.lg || '';
      case 'xl':
        return margin.xl || '';
      default:
        return margin.xl || '';
    }
  };

  return (
    <div className={`${getPadding()} ${getMargin()} ${className}`}>
      {children}
    </div>
  );
}
