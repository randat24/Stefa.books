"use client";

import { BookOpen, Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BookReadingSampleProps {
  title: string;
  sampleText?: string;
}

// Mock sample text - in real app would come from database
const defaultSampleText = `Якось ранньої весни, коли сонце тільки починало пригрівати землю після довгої зими, маленька дівчинка на ім'я Соня знайшла у своєму саду щось незвичайне.

Під старим дубом, між корінням, блищав дивний предмет. Соня обережно підняла його - це був невеликий ключик, схожий на той, що відкриває скриньки з найдорожчими скarbами.

&quot;Цікаво, від чого цей ключик?" - подумала дівчинка, розглядаючи його на сонці. Металл мерехтів усіма кольорами веселки, ніби в ньому жили маленькі фарбовані метелики.`;

export function BookReadingSample({ title, sampleText }: BookReadingSampleProps) {
  const [isReading, setIsReading] = useState(false);
  // const [currentParagraph, setCurrentParagraph] = useState(0); // Will be used for paragraph navigation
  
  const text = sampleText || defaultSampleText;
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  const toggleReading = () => {
    setIsReading(!isReading);
    // In a real app, this would control text-to-speech
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-body-lg font-semibold text-neutral-900 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Уривок для читання
        </h3>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={toggleReading}
            className="h-9"
          >
            {isReading ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Зупинити
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Прослухати
              </>
            )}
          </Button>
          
          <Button variant="outline" size="md" className="h-9">
            <Volume2 className="h-4 w-4 mr-2" />
            Звук
          </Button>
        </div>
      </div>

      {/* Reading Sample Text */}
      <div className="bg-gradient-to-b from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
        <div className="prose prose-slate max-w-none">
          {paragraphs.map((paragraph, index) => (
            <p 
              key={index}
              className={`text-neutral-800 mb-4 leading-relaxed text-body-lg transition-all duration-300 ${
                isReading 
                  ? 'bg-yellow-200 bg-opacity-50 p-2 rounded' 
                  : ''
              }`}
            >
              {paragraph}
            </p>
          ))}
        </div>
        
        {/* Sample Notice */}
        <div className="mt-6 pt-4 border-t border-amber-200">
          <p className="text-body-sm text-amber-700 italic">
            Це лише невеликий уривок з книги &quot;{title}&quot;. 
            Щоб прочитати повну історію, орендуйте книгу в нашій бібліотеці.
          </p>
        </div>
      </div>

      {/* Reading Controls */}
      <div className="bg-neutral-50 rounded-lg p-4">
        <h4 className="text-body-sm font-medium text-neutral-700 mb-3">
          Налаштування читання
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <label className="block text-neutral-600 mb-1">Розмір шрифту</label>
            <select className="w-full p-2 border border-neutral-300 rounded text-xs">
              <option>Звичайний</option>
              <option>Великий</option>
              <option>Дуже великий</option>
            </select>
          </div>
          
          <div>
            <label className="block text-neutral-600 mb-1">Швидкість</label>
            <select className="w-full p-2 border border-neutral-300 rounded text-xs">
              <option>Повільно</option>
              <option>Звичайно</option>
              <option>Швидко</option>
            </select>
          </div>
          
          <div>
            <label className="block text-neutral-600 mb-1">Голос</label>
            <select className="w-full p-2 border border-neutral-300 rounded text-xs">
              <option>Жіночий (UA)</option>
              <option>Чоловічий (UA)</option>
              <option>Дитячий (UA)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}