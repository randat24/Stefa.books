export default function TestTypographyPage() {
  return (
    <div className="min-h-screen bg-neutral-0 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Hero Section */}
        <section className="text-center bg-neutral-0 rounded-3xl p-12 shadow-xl border border-neutral-200">
          <div className="text-display mb-6">
            УЛУЧШЕНА ТИПОГРАФІКА для Книжного Сайту
          </div>
          <p className="text-lead max-w-4xl mx-auto mb-8">
            Професійна типографічна система з покращеною адаптивністю, читабельністю та UX. 
            Використовуємо сучасні веб-стандарти, функцію clamp() для адаптивності, 
            і спеціальні класи для книжкового контенту.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-small">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              Мобільна адаптивність
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
              Покращена читабельність
            </span>
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              Світла тема
            </span>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
              Доступність
            </span>
          </div>
        </section>

        {/* Typography Hierarchy */}
        <section className="bg-neutral-0 rounded-3xl p-10 shadow-xl border border-neutral-200">
          <h2 className="text-h2 mb-10 text-center">Ієрархія заголовків</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-6 py-4 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/30 dark:to-transparent rounded-r-xl">
                <div className="text-display mb-3">Display - Hero заголовки</div>
                <div className="text-small text-blue-600 dark:text-blue-400 mb-2">
                  <span className="text-code">clamp(1.75rem, 4vw, 2.25rem)</span> → 28px-36px
                </div>
                <div className="text-small text-neutral-500">SF Pro Display, font-weight: 700</div>
              </div>
              
              <div className="border-l-4 border-indigo-500 pl-6 py-4 bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-950/30 dark:to-transparent rounded-r-xl">
                <div className="text-h1 mb-3">H1 - Основні заголовки</div>
                <div className="text-small text-indigo-600 dark:text-indigo-400 mb-2">
                  <span className="text-code">clamp(1.5rem, 3vw, 1.875rem)</span> → 24px-30px
                </div>
                <div className="text-small text-neutral-500">SF Pro Display, font-weight: 600</div>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-6 py-4 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/30 dark:to-transparent rounded-r-xl">
                <div className="text-h2 mb-3">H2 - Заголовки секцій</div>
                <div className="text-small text-purple-600 dark:text-purple-400 mb-2">
                  <span className="text-code">clamp(1.25rem, 2.5vw, 1.563rem)</span> → 20px-25px
                </div>
                <div className="text-small text-neutral-500">SF Pro Display, font-weight: 600</div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="border-l-4 border-pink-500 pl-6 py-4 bg-gradient-to-r from-pink-50/50 to-transparent dark:from-pink-950/30 dark:to-transparent rounded-r-xl">
                <div className="text-h3 mb-3">H3 - Підзаголовки</div>
                <div className="text-small text-pink-600 dark:text-pink-400 mb-2">
                  <span className="text-code">clamp(1rem, 2vw, 1.25rem)</span> → 16px-20px
                </div>
                <div className="text-small text-neutral-500">SF Pro Text, font-weight: 600</div>
              </div>
              
              <div className="border-l-4 border-red-500 pl-6 py-4 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/30 dark:to-transparent rounded-r-xl">
                <div className="text-h4 mb-3">H4 - Заголовки карток</div>
                <div className="text-small text-red-600 dark:text-red-400 mb-2">
                  <span className="text-code">clamp(0.875rem, 1.5vw, 1rem)</span> → 14px-16px
                </div>
                <div className="text-small text-neutral-500">SF Pro Text, font-weight: 600</div>
              </div>
              
              <div className="border-l-4 border-amber-500 pl-6 py-4 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/30 dark:to-transparent rounded-r-xl">
                <div className="text-h5 mb-3">H5 - Допоміжні заголовки</div>
                <div className="text-small text-amber-600 dark:text-amber-400 mb-2">
                  <span className="text-code">clamp(0.8rem, 1.2vw, 0.875rem)</span> → 12.8px-14px
                </div>
                <div className="text-small text-neutral-500">SF Pro Text, font-weight: 600</div>
              </div>
              
              <div className="border-l-4 border-emerald-500 pl-6 py-4 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/30 dark:to-transparent rounded-r-xl">
                <div className="text-h6 mb-3">H6 - Мітки та категорії</div>
                <div className="text-small text-emerald-600 dark:text-emerald-400 mb-2">
                  <span className="text-code">clamp(0.75rem, 1vw, 0.8rem)</span> → 12px-12.8px
                </div>
                <div className="text-small text-neutral-500">SF Pro Text, font-weight: 600</div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Typography Classes */}
        <section className="bg-neutral-0 rounded-3xl p-10 shadow-xl border border-neutral-200">
          <h2 className="text-h2 mb-10 text-center">Додаткові класи типографіки</h2>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="border border-neutral-200 rounded-2xl p-6 bg-gradient-to-br from-blue-50/30 to-transparent">
              <h3 className="text-h4 text-blue-800 mb-4">Lead текст</h3>
              <div className="text-lead mb-4">
                Цей клас використовується для важливих повідомлень та вступних текстів. 
                Має оптимальний розмір та міжрядковий інтервал для кращої читабельності.
              </div>
              <div className="text-small text-blue-600">
                <span className="text-code">.text-lead</span> - 18px-20px, line-height: 1.7
              </div>
            </div>
            
            <div className="border border-neutral-200 dark:border-neutral-600 rounded-2xl p-6 bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-950/20 dark:to-transparent">
              <h3 className="text-h4 text-green-800 mb-4">Emphasis текст</h3>
              <div className="text-emphasis mb-4">
                Використовується для виділення важливих слів та фраз. 
                Має підвищену вагу шрифту для привернення уваги.
              </div>
              <div className="text-small text-green-600">
                <span className="text-code">.text-emphasis</span> - 16px-18px, font-weight: 600
              </div>
            </div>
            
            <div className="border border-neutral-200 dark:border-neutral-600 rounded-2xl p-6 bg-gradient-to-br from-purple-50/30 to-transparent dark:from-purple-950/20 dark:to-transparent">
              <h3 className="text-h4 text-purple-800 mb-4">Код та моноширинний</h3>
              <div className="text-small mb-4">
                Використовується для відображення коду, команд та технічних термінів.
                <span className="text-code">font-family: &quot;SF Mono&quot;</span> забезпечує чіткість.
              </div>
              <div className="text-small text-purple-600">
                <span className="text-code">.text-code</span> - 12px-14px, monospace
              </div>
            </div>
            
            <div className="border border-neutral-200 dark:border-neutral-600 rounded-2xl p-6 bg-gradient-to-br from-orange-50/30 to-transparent dark:from-orange-950/20 dark:to-transparent">
              <h3 className="text-h4 text-orange-800 mb-4">Малий текст</h3>
              <div className="text-small mb-4">
                Ідеально підходить для підписів, приміток та додаткової інформації. 
                Має оптимізований розмір для збереження читабельності.
              </div>
              <div className="text-small text-orange-600">
                <span className="text-code">.text-small</span> - 12px-14px, line-height: 1.6
              </div>
            </div>
            
            <div className="border border-neutral-200 dark:border-neutral-600 rounded-2xl p-6 bg-gradient-to-br from-pink-50/30 to-transparent dark:from-pink-950/20 dark:to-transparent">
              <h3 className="text-h4 text-pink-800 mb-4">Читабельний текст</h3>
              <div className="text-readable mb-4">
                Основний клас для довгого тексту. Оптимізований для максимальної читабельності 
                з оптимальною довжиною рядка та міжрядковим інтервалом.
              </div>
              <div className="text-small text-pink-600">
                <span className="text-code">.text-readable</span> - 16px-18px, max-width: 70ch
              </div>
            </div>
            
            <div className="border border-neutral-200 dark:border-neutral-600 rounded-2xl p-6 bg-gradient-to-br from-teal-50/30 to-transparent dark:from-teal-950/20 dark:to-transparent">
              <h3 className="text-h4 text-teal-800 mb-4">Опис книги</h3>
              <div className="book-description mb-4">
                Спеціальний клас для описів книг. Має оптимальні параметри для читання 
                довгого тексту з максимальним комфортом для очей читача.
              </div>
              <div className="text-small text-teal-600">
                <span className="text-code">.book-description</span> - 14px-16px, max-width: 68ch
              </div>
            </div>
          </div>
        </section>

        {/* Book-Specific Typography */}
        <section className="bg-neutral-0 rounded-3xl p-10 shadow-xl border border-neutral-200">
          <h2 className="text-h2 mb-10 text-center">Спеціальні класи для книжкового контенту</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Book Title */}
            <div className="border border-green-200 rounded-2xl p-8 bg-gradient-to-br from-green-50/40 to-transparent">
              <h3 className="text-h4 text-green-800 mb-4 flex items-center gap-2">
                📖 Назва книги
                <span className="text-code text-xs">.book-title</span>
              </h3>
              <div className="book-title mb-4 text-green-900">
                Гаррі Поттер і філософський камінь
              </div>
              <div className="text-small text-green-600 space-y-1">
                <div><span className="text-code">clamp(0.875rem, 1.5vw, 1rem)</span> → 14px-16px</div>
                <div>SF Pro Display, font-weight: 600</div>
                <div>line-height: 1.4, letter-spacing: -0.005em</div>
              </div>
            </div>

            {/* Book Author */}
            <div className="border border-blue-200 rounded-2xl p-8 bg-gradient-to-br from-blue-50/40 to-transparent">
              <h3 className="text-h4 text-blue-800 mb-4 flex items-center gap-2">
                Автор
                <span className="text-code text-xs">.book-author</span>
              </h3>
              <div className="book-author mb-4 text-blue-900">
                Дж. К. Роулінг
              </div>
              <div className="text-small text-blue-600 space-y-1">
                <div><span className="text-code">clamp(0.75rem, 0.9vw, 0.875rem)</span> → 12px-14px</div>
                <div>SF Pro Text, font-weight: 500</div>
                <div>line-height: 1.5, letter-spacing: 0.01em</div>
              </div>
            </div>

            {/* Book Description */}
            <div className="border border-purple-200 rounded-2xl p-8 bg-gradient-to-br from-purple-50/40 to-transparent md:col-span-2">
              <h3 className="text-h4 text-purple-800 mb-4 flex items-center gap-2">
                Опис книги
                <span className="text-code text-xs">.book-description</span>
              </h3>
              <div className="book-description mb-4 text-purple-900">
                Гаррі Поттер жив у сімʼї своїх тітки та дядька, які терпіти не могли хлопчика та приховували від нього правду про його батьків. Аж доки в день одинадцятого дня народження Гаррі не прийшов до них лист з Гогвортсу — школи чарівництва та чаклунства, де він дізнався про свое справжнє призначення.
              </div>
              <div className="text-small text-purple-600 space-y-1">
                <div><span className="text-code">clamp(0.875rem, 1.1vw, 1rem)</span> → 14px-16px</div>
                <div>SF Pro Text, line-height: 1.75, max-width: 68ch</div>
                <div>Оптимізовано для довгого читання</div>
              </div>
            </div>

            {/* Status Text */}
            <div className="border border-orange-200 rounded-2xl p-8 bg-gradient-to-br from-orange-50/40 to-transparent">
              <h3 className="text-h4 text-orange-800 mb-4 flex items-center gap-2">
                Статус книги
                <span className="text-code text-xs">.status-text</span>
              </h3>
              <div className="flex flex-wrap gap-3 mb-4">
                  <span className="status-text bg-green-100 text-green-800 px-4 py-2 rounded-xl border border-green-200">
                    Доступна
                  </span>
                  <span className="status-text bg-red-100 text-red-800 px-4 py-2 rounded-xl border border-red-200">
                    Видана
                  </span>
                  <span className="status-text bg-yellow-100 text-yellow-800 px-4 py-2 rounded-xl border border-yellow-200">
                    В очікуванні
                  </span>
              </div>
              <div className="text-small text-orange-600 space-y-1">
                <div><span className="text-code">clamp(0.7rem, 0.8vw, 0.75rem)</span> → 11.2px-12px</div>
                <div>SF Pro Text, font-weight: 600, uppercase</div>
                <div>letter-spacing: 0.04em</div>
              </div>
            </div>

            {/* Highlight Text */}
            <div className="border border-indigo-200 rounded-2xl p-8 bg-gradient-to-br from-indigo-50/40 to-transparent">
              <h3 className="text-h4 text-indigo-800 mb-4 flex items-center gap-2">
                Ціна та важлива інформація
                <span className="text-code text-xs">.highlight-text</span>
              </h3>
              <div className="space-y-3 mb-4">
                <div className="highlight-text text-indigo-900 text-2xl">
                  150 грн/місяць
                </div>
                <div className="highlight-text text-indigo-900">
                  Популярна книга
                </div>
              </div>
              <div className="text-small text-indigo-600 space-y-1">
                <div><span className="text-code">clamp(0.875rem, 1.2vw, 1rem)</span> → 14px-16px</div>
                <div>SF Pro Display, font-weight: 600</div>
                <div>line-height: 1.4</div>
              </div>
            </div>
          </div>
        </section>

        {/* Adaptive Features */}
        <section className="bg-neutral-0 rounded-3xl p-10 shadow-xl border border-neutral-200">
          <h2 className="text-h2 mb-10 text-center">Адаптивні особливості</h2>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="border border-neutral-200 rounded-2xl p-8 bg-gradient-to-br from-blue-50/30 to-transparent">
              <h3 className="text-h4 text-blue-800 mb-6 flex items-center gap-3">
                Мобільні пристрої
                <span className="text-small text-blue-600">320px-480px</span>
              </h3>
              <ul className="text-small space-y-3 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Збільшений міжрядковий інтервал (1.85) для кращої читаємості</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Оптимізований letter-spacing для малих екранів</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Додаткові breakpoint для планшетів</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Покращена контрастність для сонячного світла</span>
                </li>
              </ul>
            </div>
            
            <div className="border border-neutral-200 rounded-2xl p-8 bg-gradient-to-br from-green-50/30 to-transparent">
              <h3 className="text-h4 text-green-800 mb-6 flex items-center gap-3">
                Планшети
                <span className="text-small text-green-600">481px-1024px</span>
              </h3>
              <ul className="text-small space-y-3 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Оптимізовані розміри шрифтів для середніх екранів</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Покращений line-height для комфортного читання</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Адаптивна сітка для різних орієнтацій</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Оптимізація для touch-інтерфейсу</span>
                </li>
              </ul>
            </div>
            
            <div className="border border-neutral-200 rounded-2xl p-8 bg-gradient-to-br from-purple-50/30 to-transparent">
              <h3 className="text-h4 text-purple-800 mb-6 flex items-center gap-3">
                Великі екрани
                <span className="text-small text-purple-600">1025px+</span>
              </h3>
              <ul className="text-small space-y-3 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Максимальна ширина тексту (70-75ch) для оптимального читання</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Поліпшене text-rendering для чіткості</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Font-smoothing для кращого відображення</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Оптимізація для високих DPI екранів</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Technical Details */}
        <section className="bg-neutral-0 rounded-3xl p-10 shadow-xl border border-neutral-200">
          <h2 className="text-h2 mb-10 text-center">Технічні деталі</h2>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="border border-neutral-200 rounded-2xl p-8 bg-gradient-to-br from-yellow-50/30 to-transparent">
              <h3 className="text-h4 text-yellow-800 mb-6 flex items-center gap-2">
                Технології
              </h3>
              <ul className="space-y-3 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>SF Pro Display + SF Pro Text шрифти</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>Модульна шкала 1.25 (Major Third)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>CSS clamp() для адаптивності</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>rem-одиниці для масштабування</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>text-rendering: optimizeLegibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>font-smoothing оптимізація</span>
                </li>
              </ul>
            </div>
            
            <div className="border border-neutral-200 rounded-2xl p-8 bg-gradient-to-br from-green-50/30 to-transparent">
              <h3 className="text-h4 text-green-800 mb-6 flex items-center gap-2">
                Доступність
              </h3>
              <ul className="space-y-3 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Правильна H1-H6 ієрархія</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Семантичні HTML теги</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>WCAG 2.1 контрастність</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Підтримка світлої теми</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Клавіатурна навігація</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Screen reader підтримка</span>
                </li>
              </ul>
            </div>
            
            <div className="border border-neutral-200 rounded-2xl p-8 bg-gradient-to-br from-blue-50/30 to-transparent md:col-span-2 lg:col-span-1">
              <h3 className="text-h4 text-blue-800 mb-6 flex items-center gap-2">
                Продуктивність
              </h3>
              <ul className="space-y-3 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Оптимізоване завантаження шрифтів</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>CSS-змінні для швидкої зміни тем</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Мінімальний CSS footprint</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Адаптивні зображення</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Lazy loading підтримка</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Core Web Vitals оптимізація</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}