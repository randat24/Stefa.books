'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Zap, 
  Clock, 
  Download, 
  AlertTriangleIcon,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  bundleSize: number;
  loadTime: number;
}

interface PerformanceMonitorProps {
  showDetails?: boolean;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export default function PerformanceMonitor({ 
  showDetails = false, 
  onMetricsUpdate 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const measurePerformance = () => {
      // Измеряем Web Vitals
      const measureWebVitals = () => {
        const vitals: Partial<PerformanceMetrics> = {};

        // LCP - Largest Contentful Paint
        if ('PerformanceObserver' in window) {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.lcp = lastEntry.startTime;
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        }

        // FID - First Input Delay
        if ('PerformanceObserver' in window) {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              vitals.fid = (entry as any).processingStart - entry.startTime;
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });
        }

        // CLS - Cumulative Layout Shift
        if ('PerformanceObserver' in window) {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            });
            vitals.cls = clsValue;
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        }

        return vitals;
      };

      // Измеряем время загрузки
      const measureLoadTime = () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          ttfb: navigation.responseStart - navigation.fetchStart,
          fcp: 0 // Будет измерено через PerformanceObserver
        };
      };

      // Измеряем размер бандла (приблизительно)
      const measureBundleSize = () => {
        const scripts = document.querySelectorAll('script[src]');
        let totalSize = 0;
        scripts.forEach(script => {
          const src = (script as HTMLScriptElement).src;
          if (src.includes('_next/static')) {
            // Приблизительная оценка размера
            totalSize += 50; // kB
          }
        });
        return totalSize;
      };

      // FCP - First Contentful Paint
      if ('PerformanceObserver' in window) {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            const fcp = fcpEntry.startTime;
            const loadMetrics = measureLoadTime();
            const bundleSize = measureBundleSize();
            const webVitals = measureWebVitals();

            const performanceMetrics: PerformanceMetrics = {
              lcp: webVitals.lcp || 0,
              fid: webVitals.fid || 0,
              cls: webVitals.cls || 0,
              fcp: fcp,
              ttfb: loadMetrics.ttfb,
              bundleSize: bundleSize,
              loadTime: loadMetrics.loadTime
            };

            setMetrics(performanceMetrics);
            setLastUpdate(new Date());
            onMetricsUpdate?.(performanceMetrics);
            setIsLoading(false);
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      } else {
        // Fallback для браузеров без PerformanceObserver
        setTimeout(() => {
          const loadMetrics = measureLoadTime();
          const bundleSize = measureBundleSize();
          
          const performanceMetrics: PerformanceMetrics = {
            lcp: 0,
            fid: 0,
            cls: 0,
            fcp: loadMetrics.loadTime * 0.8, // Приблизительная оценка
            ttfb: loadMetrics.ttfb,
            bundleSize: bundleSize,
            loadTime: loadMetrics.loadTime
          };

          setMetrics(performanceMetrics);
          setLastUpdate(new Date());
          onMetricsUpdate?.(performanceMetrics);
          setIsLoading(false);
        }, 1000);
      }
    };

    // Запускаем измерение после загрузки страницы
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    return () => {
      window.removeEventListener('load', measurePerformance);
    };
  }, [onMetricsUpdate]);

  const getPerformanceScore = (metrics: PerformanceMetrics): number => {
    let score = 100;
    
    // LCP penalty (хорошо < 2.5s)
    if (metrics.lcp > 2500) score -= 30;
    else if (metrics.lcp > 1500) score -= 15;
    
    // FID penalty (хорошо < 100ms)
    if (metrics.fid > 100) score -= 25;
    else if (metrics.fid > 50) score -= 10;
    
    // CLS penalty (хорошо < 0.1)
    if (metrics.cls > 0.1) score -= 20;
    else if (metrics.cls > 0.05) score -= 10;
    
    // Bundle size penalty (хорошо < 200kB)
    if (metrics.bundleSize > 200) score -= 15;
    else if (metrics.bundleSize > 100) score -= 5;
    
    return Math.max(0, score);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 70) return <AlertTriangleIcon className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangleIcon className="h-4 w-4 text-red-600" />;
  };

  const refreshMetrics = () => {
    setIsLoading(true);
    // Перезагружаем страницу для нового измерения
    window.location.reload();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Мониторинг производительности
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-brand-accent" />
            <span className="ml-2">Измерение метрик...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Мониторинг производительности
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertTriangleIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-text-muted">Не удалось измерить метрики производительности</p>
            <Button onClick={refreshMetrics} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Попробовать снова
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const score = getPerformanceScore(metrics);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Производительность
          </CardTitle>
          <div className="flex items-center gap-2">
            {getScoreIcon(score)}
            <Badge variant={score >= 90 ? 'default' : score >= 70 ? 'secondary' : 'destructive'}>
              {score}/100
            </Badge>
            <Button size="sm" variant="outline" onClick={refreshMetrics}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {lastUpdate && (
          <p className="text-sm text-text-muted">
            Последнее обновление: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Zap className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-sm font-medium">LCP</span>
            </div>
            <div className={`text-lg font-bold ${metrics.lcp > 2500 ? 'text-red-600' : metrics.lcp > 1500 ? 'text-yellow-600' : 'text-green-600'}`}>
              {metrics.lcp > 0 ? `${(metrics.lcp / 1000).toFixed(1)}s` : 'N/A'}
            </div>
            <div className="text-xs text-text-muted">Largest Contentful Paint</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm font-medium">FID</span>
            </div>
            <div className={`text-lg font-bold ${metrics.fid > 100 ? 'text-red-600' : metrics.fid > 50 ? 'text-yellow-600' : 'text-green-600'}`}>
              {metrics.fid > 0 ? `${metrics.fid.toFixed(0)}ms` : 'N/A'}
            </div>
            <div className="text-xs text-text-muted">First Input Delay</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <AlertTriangleIcon className="h-4 w-4 text-purple-500 mr-1" />
              <span className="text-sm font-medium">CLS</span>
            </div>
            <div className={`text-lg font-bold ${metrics.cls > 0.1 ? 'text-red-600' : metrics.cls > 0.05 ? 'text-yellow-600' : 'text-green-600'}`}>
              {metrics.cls.toFixed(3)}
            </div>
            <div className="text-xs text-text-muted">Cumulative Layout Shift</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Download className="h-4 w-4 text-orange-500 mr-1" />
              <span className="text-sm font-medium">Bundle</span>
            </div>
            <div className={`text-lg font-bold ${metrics.bundleSize > 200 ? 'text-red-600' : metrics.bundleSize > 100 ? 'text-yellow-600' : 'text-green-600'}`}>
              {metrics.bundleSize}kB
            </div>
            <div className="text-xs text-text-muted">JavaScript Bundle</div>
          </div>
        </div>

        {showDetails && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-3">Детальные метрики</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-muted">FCP:</span>
                <span className="ml-2 font-medium">{(metrics.fcp / 1000).toFixed(1)}s</span>
              </div>
              <div>
                <span className="text-text-muted">TTFB:</span>
                <span className="ml-2 font-medium">{(metrics.ttfb / 1000).toFixed(1)}s</span>
              </div>
              <div>
                <span className="text-text-muted">Load Time:</span>
                <span className="ml-2 font-medium">{(metrics.loadTime / 1000).toFixed(1)}s</span>
              </div>
              <div>
                <span className="text-text-muted">Score:</span>
                <span className={`ml-2 font-medium ${getScoreColor(score)}`}>{score}/100</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
