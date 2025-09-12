"use client";

import { OptimizedImage, BookCoverImage, HeroImage, ThumbnailImage } from '@/components/ui/OptimizedImage';
import { ImageUpload } from '@/components/ui/ImageUpload';
import Image from 'next/image';
import { useState } from 'react';

/**
 * Примеры использования унифицированной системы загрузки и оптимизации изображений
 */
export function ImageOptimizationExamples() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  const handleImageUploaded = (url: string) => {
    setUploadedImageUrl(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Примеры оптимизации изображений
        </h1>
        <p className="text-lg text-gray-600">
          Демонстрация возможностей унифицированной системы загрузки и оптимизации изображений
        </p>
      </div>

      {/* Загрузка изображения */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">1. Загрузка изображения</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Загрузить новое изображение</h3>
            <ImageUpload
              uploadEndpoint="/api/upload/image"
              fieldName="file"
              onImageUploaded={handleImageUploaded}
              placeholder="Загрузить изображение для демонстрации"
              previewSize="lg"
              className="border-2 border-dashed border-gray-300 rounded-lg p-6"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Результат загрузки</h3>
            {uploadedImageUrl ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">URL: {uploadedImageUrl}</p>
                <Image 
                  src={uploadedImageUrl} 
                  alt="Загруженное изображение" 
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            ) : (
              <p className="text-gray-500">Изображение не загружено</p>
            )}
          </div>
        </div>
      </div>

      {/* Оптимизация для веб */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">2. Оптимизация для веб</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Web оптимизация</h3>
            <BookCoverImage
              src="https://res.cloudinary.com/stefa-books/image/upload/v1/stefa-books/covers/demo-book"
              alt="Демо обложка книги"
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Параметры оптимизации</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="text-sm space-y-1">
                <li>• Формат: auto (WebP/AVIF)</li>
                <li>• Качество: auto:good</li>
                <li>• Прогрессивная загрузка</li>
                <li>• Удаление ICC профилей</li>
                <li>• Автоматический DPR</li>
                <li>• sRGB цветовое пространство</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Оптимизация для мобильных */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">3. Оптимизация для мобильных</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Mobile оптимизация</h3>
            <ThumbnailImage
              src="https://res.cloudinary.com/stefa-books/image/upload/v1/stefa-books/covers/demo-book"
              alt="Демо обложка для мобильных"
              className="w-full h-auto rounded-lg shadow-md"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Параметры оптимизации</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ul className="text-sm space-y-1">
                <li>• Формат: auto (WebP/AVIF)</li>
                <li>• Качество: auto:best</li>
                <li>• Responsive изображения</li>
                <li>• Автоматический DPR</li>
                <li>• Прогрессивная загрузка</li>
                <li>• Оптимизация для мобильных сетей</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Кастомные трансформации */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">4. Кастомные трансформации</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">С эффектами</h3>
            <OptimizedImage
              src="https://res.cloudinary.com/stefa-books/image/upload/v1/stefa-books/covers/demo-book"
              alt="Демо с эффектами"
              width={300}
              height={450}
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-3">Параметры трансформации</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs overflow-x-auto">
{`{
  width: 300,
  height: 450,
  crop: 'fill',
  gravity: 'auto',
  quality: 'auto:best',
  effect: 'sharpen',
  radius: 2,
  border: '3px_solid_rgb:ffffff',
  shadow: '10px_10px_0_rgb:000000'
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Сравнение размеров */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">5. Сравнение оптимизации</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <h4 className="font-medium mb-2">Оригинал</h4>
            <Image 
              src="https://res.cloudinary.com/stefa-books/image/upload/v1/stefa-books/covers/demo-book" 
              alt="Оригинал"
              width={300}
              height={192}
              className="w-full h-48 object-cover rounded-lg mb-2"
            />
            <p className="text-sm text-gray-600">~500KB</p>
          </div>
          <div className="text-center">
            <h4 className="font-medium mb-2">WebP оптимизация</h4>
            <Image 
              src="https://res.cloudinary.com/stefa-books/image/upload/f_webp,q_auto:good,w_300,h_450,c_limit/stefa-books/covers/demo-book" 
              alt="WebP оптимизация"
              width={300}
              height={192}
              className="w-full h-48 object-cover rounded-lg mb-2"
            />
            <p className="text-sm text-gray-600">~150KB</p>
          </div>
          <div className="text-center">
            <h4 className="font-medium mb-2">AVIF оптимизация</h4>
            <Image 
              src="https://res.cloudinary.com/stefa-books/image/upload/f_avif,q_auto:best,w_300,h_450,c_limit/stefa-books/covers/demo-book" 
              alt="AVIF оптимизация"
              width={300}
              height={192}
              className="w-full h-48 object-cover rounded-lg mb-2"
            />
            <p className="text-sm text-gray-600">~80KB</p>
          </div>
        </div>
      </div>

      {/* API примеры */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">6. API примеры</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">GET запрос для оптимизации</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`const params = new URLSearchParams({
  public_id: 'stefa-books/covers/demo-book',
  width: '400',
  height: '600',
  quality: 'auto:best',
  format: 'auto',
  preset: 'web'
});

const response = await fetch(\`/api/optimize/image?\${params}\`);
const result = await response.json();
console.log(result.optimized_url);`}
              </pre>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">POST запрос с кастомными трансформациями</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`const response = await fetch('/api/optimize/image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    public_id: 'stefa-books/covers/demo-book',
    transformations: [
      { width: 400, height: 600, crop: 'fill', gravity: 'auto' },
      { quality: 'auto:best', fetch_format: 'webp' },
      { effect: 'sharpen', radius: 2 }
    ],
    preset: 'web'
  })
});`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
