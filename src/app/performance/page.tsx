'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PerformanceMonitor from '@/components/performance/PerformanceMonitor';
import { 
  Activity, 
  Zap, 
  Clock, 
  Download, 
  AlertTriangleIcon,
  CheckCircle,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Settings
} from 'lucide-react';

interface PerformanceData {
  timestamp: string;
  pages: Array<{
    route: string;
    name: string;
    size: number;
    firstLoadJS: number;
    status: string;
  }>;
  bundles: {
    totalSize: number;
    sharedJS: number;
    pagesJS: number;
  };
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    action?: string;
    items?: string[];
  }>;
}

export default function PerformancePage() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    setIsLoading(true);
    try {
      // В реальном приложении здесь был бы API вызов
      // Пока используем моковые данные
      const mockData: PerformanceData = {
        timestamp: new Date().toISOString(),
        pages: [
          { route: '/admin', name: 'Админ панель', size: 185, firstLoadJS: 185, status: '⚠️ Тяжелая' },
          { route: '/books/[id]/rent', name: 'Аренда книги', size: 193, firstLoadJS: 193, status: '⚠️ Тяжелая' },
          { route: '/profile', name: 'Профиль', size: 170, firstLoadJS: 170, status: '⚠️ Тяжелая' },
          { route: '/books', name: 'Каталог книг', size: 135, firstLoadJS: 135, status: '⚡ Средняя' },
          { route: '/', name: 'Главная', size: 160, firstLoadJS: 160, status: '⚡ Средняя' },
          { route: '/subscribe', name: 'Подписка', size: 114, firstLoadJS: 114, status: '✅ Легкая' }
        ],
        bundles: {
          totalSize: 198.6,
          sharedJS: 102,
          pagesJS: 96.6
        },
        recommendations: [
          {
            type: 'warning',
            title: 'Тяжелые страницы обнаружены',
            description: 'Найдено 3 страниц с размером > 150 kB',
            action: 'Оптимизировать код-сплиттинг и lazy loading'
          },
          {
            type: 'info',
            title: 'Большой размер бандла',
            description: 'Общий размер JS: 198.6 kB',
            action: 'Рассмотреть tree-shaking и удаление неиспользуемого кода'
          },
          {
            type: 'success',
            title: 'Рекомендации по оптимизации',
            description: 'Общие рекомендации для улучшения производительности',
            items: [
              'Включить gzip/brotli сжатие',
              'Оптимизировать изображения (WebP, AVIF)',
              'Использовать CDN для статических ресурсов',
              'Настроить кэширование браузера',
              'Внедрить Service Worker для офлайн работы'
            ]
          }
        ]
      };

      setPerformanceData(mockData);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runPerformanceAnalysis = async () => {
    setIsLoading(true);
    try {
      // Запускаем анализ производительности
      const response = await fetch('/api/performance/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPerformanceData(data);
      } else {
        // Fallback к моковым данным
        await loadPerformanceData();
      }
    } catch (error) {
      console.error('Error running performance analysis:', error);
      await loadPerformanceData();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="section-sm">
        <div className="container">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-accent mr-3" />
            <span className="text-lg">Анализ производительности...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-sm">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="h1 text-accent mb-2">Анализ производительности</h1>
              <p className="text-text-muted">
                Мониторинг и оптимизация скорости загрузки приложения
              </p>
            </div>
            <Button onClick={runPerformanceAnalysis} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Обновить анализ
            </Button>
          </div>
        </div>

        {/* Real-time Performance Monitor */}
        <div className="mb-8">
          <PerformanceMonitor showDetails={true} />
        </div>

        {/* Analysis Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="pages">Страницы</TabsTrigger>
            <TabsTrigger value="bundles">Бандлы</TabsTrigger>
            <TabsTrigger value="recommendations">Рекомендации</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-text-muted">Всего страниц</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performanceData?.pages.length || 0}</div>
                  <p className="text-xs text-text-muted">активных маршрутов</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-text-muted">Тяжелых страниц</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {performanceData?.pages.filter(p => p.firstLoadJS > 150).length || 0}
                  </div>
                  <p className="text-xs text-text-muted">размер &gt; 150 kB</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-text-muted">Средний размер</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceData ? Math.round(
                      performanceData.pages.reduce((sum, p) => sum + p.firstLoadJS, 0) / 
                      performanceData.pages.length
                    ) : 0} kB
                  </div>
                  <p className="text-xs text-text-muted">на страницу</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Распределение размеров страниц
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData?.pages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          page.firstLoadJS > 150 ? 'destructive' : 
                          page.firstLoadJS > 100 ? 'secondary' : 'default'
                        }>
                          {page.status}
                        </Badge>
                        <span className="font-medium">{page.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-neutral-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              page.firstLoadJS > 150 ? 'bg-red-500' : 
                              page.firstLoadJS > 100 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(100, (page.firstLoadJS / 200) * 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-16 text-right">
                          {page.firstLoadJS} kB
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Анализ страниц
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Страница</th>
                        <th className="text-left py-2">Размер</th>
                        <th className="text-left py-2">First Load JS</th>
                        <th className="text-left py-2">Статус</th>
                        <th className="text-left py-2">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceData?.pages.map((page, index) => (
                        <tr key={index} className="border-b hover:bg-neutral-50">
                          <td className="py-3">
                            <div>
                              <div className="font-medium">{page.name}</div>
                              <div className="text-sm text-text-muted">{page.route}</div>
                            </div>
                          </td>
                          <td className="py-3">{page.size} kB</td>
                          <td className="py-3">{page.firstLoadJS} kB</td>
                          <td className="py-3">
                            <Badge variant={
                              page.firstLoadJS > 150 ? 'destructive' : 
                              page.firstLoadJS > 100 ? 'secondary' : 'default'
                            }>
                              {page.status}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Button size="sm" variant="outline">
                              Оптимизировать
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bundles Tab */}
          <TabsContent value="bundles" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Размеры бандлов
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Общий размер JS</span>
                      <span className="font-bold">{performanceData?.bundles.totalSize} kB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Shared JS</span>
                      <span className="font-medium">{performanceData?.bundles.sharedJS} kB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Pages JS</span>
                      <span className="font-medium">{performanceData?.bundles.pagesJS} kB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Рекомендации по бандлам
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Включить tree-shaking</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Оптимизировать импорты</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Использовать динамические импорты</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Настроить code splitting</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {performanceData?.recommendations.map((rec, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {rec.type === 'warning' && <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />}
                    {rec.type === 'info' && <Settings className="h-5 w-5 text-blue-500" />}
                    {rec.type === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {rec.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-muted mb-4">{rec.description}</p>
                  {rec.action && (
                    <div className="mb-4">
                      <strong>Действие:</strong> {rec.action}
                    </div>
                  )}
                  {rec.items && (
                    <div>
                      <strong>Детали:</strong>
                      <ul className="mt-2 space-y-1">
                        {rec.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-2">
                            <span className="text-green-500">•</span>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
