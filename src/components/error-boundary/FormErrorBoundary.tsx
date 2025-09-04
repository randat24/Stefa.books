"use client";

import React from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormErrorFallbackProps {
  resetError: () => void;
}

function FormErrorFallback({ resetError }: FormErrorFallbackProps) {
  return (
    <div className="border border-red-200 bg-red-50 rounded-lg p-6 space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-900">
            Помилка форми
          </h3>
          <p className="text-red-700">
            Не вдалося завантажити форму підписки
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-red-600">
          Можливі причини:
        </p>
        <ul className="text-sm text-red-600 space-y-1 ml-4">
          <li>• Проблеми з мережею</li>
          <li>• Тимчасова недоступність сервісу</li>
          <li>• Помилка в браузері</li>
        </ul>
      </div>

      <div className="flex space-x-3">
        <Button variant="outline" onClick={resetError} size="lg">
          <RefreshCw size={16} className="mr-2" />
          Спробувати знову
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => window.location.href = '/'}
          size="lg"
        >
          Повернутися на головну
        </Button>
      </div>
    </div>
  );
}

interface FormErrorBoundaryProps {
  children: React.ReactNode;
}

export function FormErrorBoundary({ children }: FormErrorBoundaryProps) {
  return (
    <ErrorBoundary 
      fallback={<FormErrorFallback resetError={() => window.location.reload()} />}
      onError={(error) => {
        console.error('Form error:', error);
        // Track form errors for analytics
      }}
    >
      {children}
    </ErrorBoundary>
  );
}