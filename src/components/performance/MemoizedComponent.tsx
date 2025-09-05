'use client';

import React, { memo, useMemo, useCallback, useRef, useEffect } from 'react';

interface MemoizedComponentProps {
  children: React.ReactNode;
  dependencies?: any[];
  className?: string;
  onRender?: () => void;
}

/**
 * Компонент с мемоизацией для предотвращения ненужных ре-рендеров
 */
export const MemoizedComponent = memo<MemoizedComponentProps>(({
  children,
  dependencies = [],
  className = '',
  onRender
}) => {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    onRender?.();
  });

  return (
    <div className={className}>
      {children}
    </div>
  );
});

MemoizedComponent.displayName = 'MemoizedComponent';

/**
 * HOC для мемоизации компонентов
 */
export function withMemo<P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) {
  const MemoizedComponent = memo(Component, areEqual);
  MemoizedComponent.displayName = `Memoized(${Component.displayName || Component.name})`;
  return MemoizedComponent;
}

/**
 * Компонент для мемоизации списков
 */
interface MemoizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  className?: string;
  itemClassName?: string;
  onItemRender?: (item: T, index: number) => void;
}

export function MemoizedList<T>({
  items,
  renderItem,
  keyExtractor,
  className = '',
  itemClassName = '',
  onItemRender
}: MemoizedListProps<T>) {
  const memoizedItems = useMemo(() => {
    return items.map((item, index) => ({
      item,
      index,
      key: keyExtractor(item, index)
    }));
  }, [items, keyExtractor]);

  return (
    <div className={className}>
      {memoizedItems.map(({ item, index, key }) => (
        <MemoizedItem
          key={key}
          item={item}
          index={index}
          renderItem={renderItem}
          className={itemClassName}
          onRender={onItemRender}
        />
      ))}
    </div>
  );
}

/**
 * Мемоизированный элемент списка
 */
interface MemoizedItemProps<T> {
  item: T;
  index: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  onRender?: (item: T, index: number) => void;
}

const MemoizedItem = memo<MemoizedItemProps<any>>(({
  item,
  index,
  renderItem,
  className = '',
  onRender
}) => {
  useEffect(() => {
    onRender?.(item, index);
  }, [item, index, onRender]);

  return (
    <div className={className}>
      {renderItem(item, index)}
    </div>
  );
});

MemoizedItem.displayName = 'MemoizedItem';

/**
 * Компонент для мемоизации форм
 */
interface MemoizedFormProps {
  children: React.ReactNode;
  onSubmit: (data: any) => void;
  initialValues?: Record<string, any>;
  className?: string;
  onValuesChange?: (values: Record<string, any>) => void;
}

export function MemoizedForm({
  children,
  onSubmit,
  initialValues = {},
  className = '',
  onValuesChange
}: MemoizedFormProps) {
  const [values, setValues] = React.useState(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  }, [values, onSubmit]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => {
      const newValues = { ...prev, [name]: value };
      onValuesChange?.(newValues);
      return newValues;
    });
  }, [onValuesChange]);

  const handleError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const formContext = useMemo(() => ({
    values,
    errors,
    onChange: handleChange,
    onError: handleError
  }), [values, errors, handleChange, handleError]);

  return (
    <form onSubmit={handleSubmit} className={className}>
      <FormContext.Provider value={formContext}>
        {children}
      </FormContext.Provider>
    </form>
  );
}

// Контекст для формы
const FormContext = React.createContext<{
  values: Record<string, any>;
  errors: Record<string, string>;
  onChange: (name: string, value: any) => void;
  onError: (name: string, error: string) => void;
} | null>(null);

/**
 * Хук для использования контекста формы
 */
export function useFormContext() {
  const context = React.useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within MemoizedForm');
  }
  return context;
}

/**
 * Компонент для мемоизации вычислений
 */
interface MemoizedComputationProps<T> {
  compute: () => T;
  dependencies: any[];
  children: (result: T) => React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function MemoizedComputation<T>({
  compute,
  dependencies,
  children,
  fallback,
  className = ''
}: MemoizedComputationProps<T>) {
  const result = useMemo(() => {
    try {
      return compute();
    } catch (error) {
      console.error('Error in memoized computation:', error);
      return null;
    }
  }, dependencies);

  if (result === null) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <div className={className}>
      {children(result)}
    </div>
  );
}

/**
 * Компонент для мемоизации асинхронных операций
 */
interface MemoizedAsyncProps<T> {
  asyncFn: () => Promise<T>;
  dependencies: any[];
  children: (result: T | null, loading: boolean, error: Error | null) => React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function MemoizedAsync<T>({
  asyncFn,
  dependencies,
  children,
  fallback,
  className = ''
}: MemoizedAsyncProps<T>) {
  const [result, setResult] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const memoizedAsyncFn = useCallback(asyncFn, dependencies);

  useEffect(() => {
    let isMounted = true;

    const executeAsync = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await memoizedAsyncFn();
        
        if (isMounted) {
          setResult(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    executeAsync();

    return () => {
      isMounted = false;
    };
  }, [memoizedAsyncFn]);

  if (loading && !result) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <div className={className}>
      {children(result, loading, error)}
    </div>
  );
}

/**
 * Хук для мемоизации колбэков
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T {
  return useCallback(callback, dependencies);
}

/**
 * Хук для мемоизации значений
 */
export function useMemoizedValue<T>(
  value: T,
  dependencies: any[]
): T {
  return useMemo(() => value, dependencies);
}
