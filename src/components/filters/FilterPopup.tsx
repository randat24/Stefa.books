'use client';

import { useEffect } from 'react';
import { X, Building2, Users, Grid3X3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

// Top categories like in the catalog
const topCategories = [
  { name: "Історія України для дітей", icon: "📚" },
  { name: "Back to School & Back to Office", icon: "🎒" },
  { name: "Для школярів", icon: "🎓" },
  { name: "Книжки Сергія Жадана зі знижкою", icon: "📖" },
  { name: "Все про материнство", icon: "🤱" }
];

// Categories structure similar to catalog
const filterCategories = [
  {
    title: "Художня література",
    items: [
      "Сучасна проза",
      "Класична література", 
      "Фантастика"
    ],
    expandText: "+ 18 категорій"
  },
  {
    title: "Нонфікшн",
    items: [
      "Історія",
      "Наука й технології",
      "Мотивація й саморозвиток"
    ],
    expandText: "+ 24 категорії"
  },
  {
    title: "Книжки для дітей", 
    items: [
      "Художня література для дітей",
      "Книжки для розвитку",
      "Література зі шкільної програми"
    ],
    expandText: "+ 5 категорій"
  },
  {
    title: "Література іноземними мовами",
    items: [
      "Художня література",
      "Нонфікшн", 
      "Дитяча література"
    ],
    expandText: "+ 5 категорій"
  },
  {
    title: "Довідники і навчальна література",
    items: [
      "Підручники й посібники",
      "Енциклопедії",
      "Словники"
    ],
    expandText: "+ 4 категорії"
  },
  {
    title: "Подарункові видання",
    items: [
      "Класика",
      "Серії книг", 
      "Мистецькі"
    ],
    expandText: "+ 4 категорії"
  },
  {
    title: "Періодичні видання", 
    items: [
      "Журнали",
      "Колекційні видання"
    ],
    expandText: ""
  },
  {
    title: "Блокноти і щоденники",
    items: [
      "Блокноти й скетчбуки",
      "Читацькі щоденники",
      "Книги для спогадів і фотоальбоми"
    ],
    expandText: ""
  },
  {
    title: "Тест",
    items: [],
    expandText: ""
  },
  {
    title: "Розваги, ігри та хобі",
    items: [],
    expandText: ""
  }
];

export function FilterPopup({ isOpen, onClose }: FilterPopupProps) {
  const router = useRouter();

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleCategoryClick = (category: string) => {
    router.push(`/books?category=${encodeURIComponent(category)}`);
    onClose();
  };

  const handleShowAll = () => {
    router.push('/books');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Popup Content */}
      <div className="relative bg-white min-h-screen md:min-h-0 md:max-h-[90vh] md:rounded-2xl md:m-4 md:mx-auto md:max-w-6xl md:mt-20 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Каталог</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Top Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
            {topCategories.map((category, index) => (
              <button
                key={index}
                onClick={() => handleCategoryClick(category.name)}
                className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition text-left"
              >
                <span className="text-xl">{category.icon}</span>
                <span className="text-sm font-medium text-slate-900 line-clamp-2">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Lists Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Списки</h3>
              <div className="flex gap-1">
                <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Видавництва
                </button>
                <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Автори  
                </button>
              </div>
              <button
                onClick={handleShowAll}
                className="ml-auto px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium hover:bg-slate-50 transition flex items-center gap-2"
              >
                Показати все
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filterCategories.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h4 className="font-semibold text-slate-900 mb-4">{section.title}</h4>
                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      onClick={() => handleCategoryClick(item)}
                      className="block text-sm text-slate-600 hover:text-slate-900 transition text-left"
                    >
                      {item}
                    </button>
                  ))}
                  {section.expandText && (
                    <button
                      onClick={handleShowAll}
                      className="block text-sm text-yellow-600 hover:text-yellow-700 font-medium transition"
                    >
                      {section.expandText}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}