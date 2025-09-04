'use client';

import { useState, useEffect, useRef } from 'react';
import { observeElement } from '@/lib/intersection-observer';

interface LazySectionProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  className?: string;
  threshold?: number;
}

/**
 * LazySection - A component that delays rendering of its children until
 * they are about to enter the viewport.
 */
export function LazySection({
  children,
  placeholder = <div className="h-32 bg-slate-50 animate-pulse rounded-lg" />,
  className = '',
  // threshold = 0.1 // Will be used for intersection observer configuration
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // For immediate loading (fallback), set a timeout
    const immediateLoadTimer = setTimeout(() => {
      if (!isVisible) {
        console.log('LazySection: Loading content after timeout');
        setIsVisible(true);
      }
    }, 3000); // Load after 3 seconds if intersection observer fails

    if (containerRef.current) {
      console.log('LazySection: Observing element');
      observeElement(containerRef.current, () => {
        console.log('LazySection: Element is visible, loading content');
        setIsVisible(true);
        clearTimeout(immediateLoadTimer);
      });
    }

    // Cleanup
    return () => {
      clearTimeout(immediateLoadTimer);
    };
  }, [isVisible]);

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? children : placeholder}
    </div>
  );
}