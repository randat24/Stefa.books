'use client';

import { ColorSystemButtonExamples } from '@/components/examples/ColorSystemButton';
import { ColorSystemCardExamples } from '@/components/examples/ColorSystemCard';

export default function ColorSystemDemoPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-display text-neutral-900 mb-4">
              Stefa.Books Color System Demo
            </h1>
            <p className="text-readable text-neutral-600 max-w-2xl mx-auto">
              Демонстрация новой цветовой системы с семантическими токенами, 
              WCAG 2.1 AA контрастностью и готовностью к темной теме.
            </p>
          </div>

          {/* Color Palette */}
          <div className="mb-12">
            <h2 className="text-h2 text-neutral-900 mb-6">Цветовая палитра</h2>
            
            {/* Brand Colors */}
            <div className="mb-8">
              <h3 className="text-h3 text-neutral-800 mb-4">Brand Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-brand text-neutral-0 p-4 rounded-lg text-center">
                  <div className="text-body-sm font-medium">Brand Primary</div>
                  <div className="text-caption opacity-80">#2563eb</div>
                </div>
                <div className="bg-brand-700 text-neutral-0 p-4 rounded-lg text-center">
                  <div className="text-body-sm font-medium">Brand 700</div>
                  <div className="text-caption opacity-80">#1d4ed8</div>
                </div>
                <div className="bg-brand-100 text-brand-900 p-4 rounded-lg text-center">
                  <div className="text-body-sm font-medium">Brand 100</div>
                  <div className="text-caption opacity-80">#dbeafe</div>
                </div>
                <div className="bg-brand-50 text-brand-900 p-4 rounded-lg text-center">
                  <div className="text-body-sm font-medium">Brand 50</div>
                  <div className="text-caption opacity-80">#eff6ff</div>
                </div>
              </div>
            </div>

            {/* Accent Colors */}
            <div className="mb-8">
              <h3 className="text-h3 text-neutral-800 mb-4">Accent Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-accent text-neutral-0 p-4 rounded-lg text-center">
                  <div className="text-body-sm font-medium">Accent Warm</div>
                  <div className="text-caption opacity-80">#f59e0b</div>
                </div>
                <div className="bg-accent-700 text-neutral-0 p-4 rounded-lg text-center">
                  <div className="text-body-sm font-medium">Accent 700</div>
                  <div className="text-caption opacity-80">#d97706</div>
                </div>
                <div className="bg-accent-100 text-accent-900 p-4 rounded-lg text-center">
                  <div className="text-body-sm font-medium">Accent 100</div>
                  <div className="text-caption opacity-80">#fef3c7</div>
                </div>
                <div className="bg-accent-50 text-accent-900 p-4 rounded-lg text-center">
                  <div className="text-body-sm font-medium">Accent 50</div>
                  <div className="text-caption opacity-80">#fffbeb</div>
                </div>
              </div>
            </div>

            {/* Neutral Colors */}
            <div className="mb-8">
              <h3 className="text-h3 text-neutral-800 mb-4">Neutral Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-neutral-900 text-neutral-0 p-4 rounded-lg text-center">
                  <div className="text-body-sm font-medium">900</div>
                  <div className="text-caption opacity-80">#171717</div>
                </div>
                <div className="bg-neutral-700 text-neutral-0 p-4 rounded-lg text-center">
                  <div className="text-body-sm font-medium">700</div>
                  <div className="text-caption opacity-80">#404040</div>
                </div>
                <div className="bg-neutral-500 text-neutral-0 p-4 rounded-lg text-center">
                  <div className="text-body-sm font-medium">500</div>
                  <div className="text-caption opacity-80">#737373</div>
                </div>
                <div className="bg-neutral-200 text-neutral-900 p-4 rounded-lg text-center">
                  <div className="text-body-sm font-medium">200</div>
                  <div className="text-caption opacity-80">#e5e5e5</div>
                </div>
                <div className="bg-neutral-50 text-neutral-900 p-4 rounded-lg text-center">
                  <div className="text-body-sm font-medium">50</div>
                  <div className="text-caption opacity-80">#fafafa</div>
                </div>
              </div>
            </div>

            {/* Semantic Colors */}
            <div className="mb-8">
              <h3 className="text-h3 text-neutral-800 mb-4">Semantic Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-success text-neutral-0 p-4 rounded-lg text-center">
                  <div className="text-body-sm font-medium">Success</div>
                  <div className="text-caption opacity-80">#10b981</div>
                </div>
                <div className="bg-warning text-neutral-0 p-4 rounded-lg text-center">
                  <div className="text-body-sm font-medium">Warning</div>
                  <div className="text-caption opacity-80">#f59e0b</div>
                </div>
                <div className="bg-error text-neutral-0 p-4 rounded-lg text-center">
                  <div className="text-body-sm font-medium">Error</div>
                  <div className="text-caption opacity-80">#ef4444</div>
                </div>
                <div className="bg-info text-neutral-0 p-4 rounded-lg text-center">
                  <div className="text-body-sm font-medium">Info</div>
                  <div className="text-caption opacity-80">#06b6d4</div>
                </div>
              </div>
            </div>
          </div>

          {/* Typography Examples */}
          <div className="mb-12">
            <h2 className="text-h2 text-neutral-900 mb-6">Типографика</h2>
            <div className="bg-neutral-0 border border-neutral-200 rounded-xl p-8">
              <div className="space-y-6">
                <div>
                  <h1 className="text-display text-neutral-900 mb-2">Display Heading</h1>
                  <p className="text-caption text-neutral-500">text-display</p>
                </div>
                
                <div>
                  <h2 className="text-h1 text-neutral-900 mb-2">Heading 1</h2>
                  <p className="text-caption text-neutral-500">text-h1</p>
                </div>
                
                <div>
                  <h3 className="text-h2 text-neutral-900 mb-2">Heading 2</h3>
                  <p className="text-caption text-neutral-500">text-h2</p>
                </div>
                
                <div>
                  <h4 className="text-h3 text-neutral-900 mb-2">Heading 3</h4>
                  <p className="text-caption text-neutral-500">text-h3</p>
                </div>
                
                <div>
                  <p className="text-readable text-neutral-600 mb-2">
                    Основной читаемый текст с оптимальной контрастностью и длиной строки. 
                    Этот текст использует семантический класс text-readable для максимальной читаемости.
                  </p>
                  <p className="text-caption text-neutral-500">text-readable</p>
                </div>
                
                <div>
                  <p className="text-body text-neutral-600 mb-2">
                    Стандартный текст для основного контента
                  </p>
                  <p className="text-caption text-neutral-500">text-body</p>
                </div>
                
                <div>
                  <p className="text-body-sm text-neutral-500 mb-2">
                    Мелкий текст для дополнительной информации
                  </p>
                  <p className="text-caption text-neutral-500">text-body-sm</p>
                </div>
                
                <div>
                  <p className="text-caption text-neutral-400">
                    Подпись или метаданные
                  </p>
                  <p className="text-caption text-neutral-500">text-caption</p>
                </div>
              </div>
            </div>
          </div>

          {/* Component Examples */}
          <ColorSystemButtonExamples />
          <ColorSystemCardExamples />

          {/* Accessibility Info */}
          <div className="mt-12 bg-info-50 border border-info-200 rounded-xl p-6">
            <h3 className="text-h3 text-info-900 mb-4">Accessibility Information</h3>
            <div className="space-y-2 text-readable text-info-700">
              <p>• Все цвета соответствуют WCAG 2.1 AA стандартам контрастности</p>
              <p>• Минимальный контраст 4.5:1 для обычного текста</p>
              <p>• Минимальный контраст 3:1 для крупного текста</p>
              <p>• Поддержка клавиатурной навигации</p>
              <p>• Готовность к темной теме</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}