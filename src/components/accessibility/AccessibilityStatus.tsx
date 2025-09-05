'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { checkComponentAccessibility } from '@/lib/accessibility';

interface AccessibilityStatusProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
  showDetails?: boolean;
  autoCheck?: boolean;
}

/**
 * Компонент для отображения статуса доступности
 */
export function AccessibilityStatus({
  containerRef,
  className = '',
  showDetails = false,
  autoCheck = true
}: AccessibilityStatusProps) {
  const [status, setStatus] = useState<{
    score: number;
    issues: string[];
    suggestions: string[];
  } | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const checkAccessibility = useCallback(async () => {
    if (!containerRef.current) return;

    setIsChecking(true);
    
    // Небольшая задержка для анимации
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = checkComponentAccessibility(containerRef.current);
    setStatus(result);
    setIsChecking(false);
  }, [containerRef]);

  useEffect(() => {
    if (autoCheck && containerRef.current) {
      checkAccessibility();
    }
  }, [autoCheck, checkAccessibility, containerRef]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Відмінно';
    if (score >= 70) return 'Добре';
    if (score >= 50) return 'Потребує покращення';
    return 'Критично';
  };

  if (!status) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-5 h-5 border-2 border-gray-300 border-t-brand-yellow rounded-full animate-spin" />
        <span className="text-sm text-gray-600">Перевірка доступності...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Основной статус */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getScoreIcon(status.score)}
          <span className="text-sm font-medium">
            Доступність: {status.score}/100
          </span>
          <span className={`text-xs ${getScoreColor(status.score)}`}>
            ({getScoreLabel(status.score)})
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={checkAccessibility}
            disabled={isChecking}
            className="
              text-xs text-gray-600 hover:text-gray-800
              focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2
              rounded px-2 py-1 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {isChecking ? 'Перевірка...' : 'Перевірити'}
          </button>
          
          {showDetails && (
            <button
              onClick={() => setShowReport(!showReport)}
              className="
                text-xs text-gray-600 hover:text-gray-800
                focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2
                rounded px-2 py-1 transition-colors
              "
            >
              {showReport ? 'Приховати' : 'Деталі'}
            </button>
          )}
        </div>
      </div>

      {/* Прогресс-бар */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            status.score >= 90 ? 'bg-green-500' :
            status.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${status.score}%` }}
        />
      </div>

      {/* Детальный отчет */}
      {showDetails && showReport && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
          {/* Проблемы */}
          {status.issues.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                Проблеми ({status.issues.length})
              </h4>
              <ul className="space-y-1">
                {status.issues.map((issue, index) => (
                  <li key={index} className="text-xs text-red-700 flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Рекомендации */}
          {status.suggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-1">
                <Info className="w-4 h-4" />
                Рекомендації ({status.suggestions.length})
              </h4>
              <ul className="space-y-1">
                {status.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-xs text-blue-700 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Сообщение об успехе */}
          {status.issues.length === 0 && status.suggestions.length === 0 && (
            <div className="text-center py-4">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-green-700 font-medium">
                Відмінно! Компонент повністю доступний
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Компонент для быстрой проверки доступности в режиме разработки
 */
export function DevAccessibilityChecker({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    setIsDev(process.env.NODE_ENV === 'development');
  }, []);

  if (!isDev) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className={className}>
      {children}
      <div className="fixed bottom-4 right-4 z-50">
        <AccessibilityStatus
          containerRef={containerRef}
          showDetails={true}
          autoCheck={true}
          className="bg-white shadow-lg rounded-lg p-3 border"
        />
      </div>
    </div>
  );
}
