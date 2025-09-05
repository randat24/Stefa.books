'use client';

import React, { Suspense, lazy, ComponentType, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface CodeSplitProps {
  children: ReactNode;
  fallback?: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Компонент для code splitting с задержкой
 */
export function CodeSplit({
  children,
  fallback,
  delay = 200,
  className = ''
}: CodeSplitProps) {
  const [showContent, setShowContent] = React.useState(delay === 0);

  React.useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  const defaultFallback = (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-brand-yellow" />
    </div>
  );

  if (!showContent) {
    return <div className={className}>{fallback || defaultFallback}</div>;
  }

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}

/**
 * HOC для lazy loading компонентов с code splitting
 */
export function withCodeSplit<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    fallback?: ReactNode;
    delay?: number;
    className?: string;
  }
) {
  const LazyComponent = lazy(importFunc);

  return function CodeSplitComponent(props: P) {
    return (
      <CodeSplit
        fallback={options?.fallback}
        delay={options?.delay}
        className={options?.className}
      >
        <LazyComponent {...props} />
      </CodeSplit>
    );
  };
}

/**
 * Компонент для динамической загрузки модулей
 */
interface DynamicImportProps {
  importFunc: () => Promise<{ default: ComponentType<any> }>;
  fallback?: ReactNode;
  delay?: number;
  className?: string;
  props?: Record<string, any>;
}

export function DynamicImport({
  importFunc,
  fallback,
  delay = 200,
  className = '',
  props = {}
}: DynamicImportProps) {
  const [Component, setComponent] = React.useState<ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const loadComponent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const module = await importFunc();
        
        if (isMounted) {
          setComponent(() => module.default);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      }
    };

    if (delay > 0) {
      const timer = setTimeout(loadComponent, delay);
      return () => {
        clearTimeout(timer);
        isMounted = false;
      };
    } else {
      loadComponent();
    }

    return () => {
      isMounted = false;
    };
  }, [importFunc, delay]);

  const defaultFallback = (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-brand-yellow" />
    </div>
  );

  if (isLoading) {
    return <div className={className}>{fallback || defaultFallback}</div>;
  }

  if (error) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <div className="text-red-600 mb-2">Помилка завантаження</div>
        <div className="text-sm text-gray-600">{error.message}</div>
      </div>
    );
  }

  if (!Component) {
    return <div className={className}>{fallback || defaultFallback}</div>;
  }

  return (
    <div className={className}>
      <Component {...props} />
    </div>
  );
}

/**
 * Компонент для предзагрузки модулей
 */
interface PreloadProps {
  importFunc: () => Promise<any>;
  children: ReactNode;
  priority?: boolean;
}

export function Preload({ importFunc, children, priority = false }: PreloadProps) {
  React.useEffect(() => {
    if (priority) {
      // Предзагружаем сразу
      importFunc().catch(console.error);
    } else {
      // Предзагружаем при idle
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          importFunc().catch(console.error);
        });
      } else {
        setTimeout(() => {
          importFunc().catch(console.error);
        }, 1000);
      }
    }
  }, [importFunc, priority]);

  return <>{children}</>;
}

/**
 * Хук для динамической загрузки модулей
 */
export function useDynamicImport<T = any>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  options?: {
    delay?: number;
    preload?: boolean;
  }
) {
  const [Component, setComponent] = React.useState<ComponentType<T> | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const loadComponent = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const module = await importFunc();
      setComponent(() => module.default);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [importFunc]);

  React.useEffect(() => {
    if (options?.preload) {
      loadComponent();
    }
  }, [loadComponent, options?.preload]);

  return {
    Component,
    isLoading,
    error,
    loadComponent
  };
}

/**
 * Компонент для условной загрузки модулей
 */
interface ConditionalLoadProps {
  condition: boolean;
  importFunc: () => Promise<{ default: ComponentType<any> }>;
  fallback?: ReactNode;
  delay?: number;
  className?: string;
  props?: Record<string, any>;
}

export function ConditionalLoad({
  condition,
  importFunc,
  fallback,
  delay = 200,
  className = '',
  props = {}
}: ConditionalLoadProps) {
  const [Component, setComponent] = React.useState<ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!condition) {
      setComponent(null);
      return;
    }

    let isMounted = true;

    const loadComponent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const module = await importFunc();
        
        if (isMounted) {
          setComponent(() => module.default);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      }
    };

    if (delay > 0) {
      const timer = setTimeout(loadComponent, delay);
      return () => {
        clearTimeout(timer);
        isMounted = false;
      };
    } else {
      loadComponent();
    }

    return () => {
      isMounted = false;
    };
  }, [condition, importFunc, delay]);

  const defaultFallback = (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Loader2 className="w-8 h-8 animate-spin text-brand-yellow" />
    </div>
  );

  if (!condition) {
    return null;
  }

  if (isLoading) {
    return <div className={className}>{fallback || defaultFallback}</div>;
  }

  if (error) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <div className="text-red-600 mb-2">Помилка завантаження</div>
        <div className="text-sm text-gray-600">{error.message}</div>
      </div>
    );
  }

  if (!Component) {
    return <div className={className}>{fallback || defaultFallback}</div>;
  }

  return (
    <div className={className}>
      <Component {...props} />
    </div>
  );
}
