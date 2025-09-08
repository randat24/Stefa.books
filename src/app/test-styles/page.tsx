export default function TestStylesPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <h1 className="text-h1 text-brand mb-8">🎨 Единая Система Дизайна Stefa.Books</h1>
      
      {/* Colors Palette */}
      <section className="mb-12">
        <h2 className="text-h2 font-semibold mb-6 text-gray-900">Цветовая Палитра</h2>
        
        <div className="mb-8">
          <h3 className="text-body-lg font-medium mb-4 text-gray-800">Основные цвета бренда</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-brand text-white p-6 rounded-lg shadow-md text-center">
              <div className="font-semibold">Brand Default</div>
              <div className="text-body-sm opacity-90">#0B1220</div>
              <div className="text-caption mt-1">text-brand, bg-brand</div>
            </div>
            <div className="bg-brand-light text-white p-6 rounded-lg shadow-md text-center">
              <div className="font-semibold">Brand Light</div>
              <div className="text-body-sm opacity-90">#1e293b</div>
              <div className="text-caption mt-1">text-brand-light</div>
            </div>
            <div className="bg-brand-yellow text-brand p-6 rounded-lg shadow-md text-center">
              <div className="font-semibold">Brand Yellow</div>
              <div className="text-body-sm opacity-90">#eab308</div>
              <div className="text-caption mt-1">text-brand-yellow</div>
            </div>
            <div className="bg-brand-accent text-white p-6 rounded-lg shadow-md text-center">
              <div className="font-semibold">Brand Accent</div>
              <div className="text-body-sm opacity-90">#2563eb</div>
              <div className="text-caption mt-1">text-brand-accent</div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-body-lg font-medium mb-4 text-gray-800">Семантические цвета</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-500 text-white p-6 rounded-lg shadow-md text-center">
              <div className="font-semibold">Success</div>
              <div className="text-body-sm opacity-90">bg-green-500</div>
            </div>
            <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-md text-center">
              <div className="font-semibold">Warning</div>
              <div className="text-body-sm opacity-90">bg-yellow-500</div>
            </div>
            <div className="bg-red-500 text-white p-6 rounded-lg shadow-md text-center">
              <div className="font-semibold">Error</div>
              <div className="text-body-sm opacity-90">bg-red-500</div>
            </div>
          </div>
        </div>
      </section>

      {/* Новая умная типографика */}
      <section className="mb-12">
        <h2 className="text-h2 mb-6 text-gray-900">🎯 Умная адаптивная типографика</h2>
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
          
          {/* Заголовки */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-h4 mb-4 text-gray-800">Заголовки (rem-единицы + адаптивность)</h3>
            <div className="space-y-4">
              <h1 className="text-display font-smooth text-gray-900">Display - Главный заголовок (.text-display)</h1>
              <h1 className="text-h1 font-smooth text-gray-900">H1 - Основной заголовок (.text-h1)</h1>
              <h2 className="text-h2 font-smooth text-gray-800">H2 - Заголовок секции (.text-h2)</h2>
              <h3 className="text-h3 font-smooth text-gray-700">H3 - Подзаголовок (.text-h3)</h3>
              <h4 className="text-h4 font-smooth text-gray-600">H4 - Мелкий заголовок (.text-h4)</h4>
              <h5 className="text-h5 font-smooth text-gray-600">H5 - Минизаголовок (.text-h5)</h5>
              <h6 className="text-h6 font-smooth text-gray-600">H6 - Микрозаголовок (.text-h6)</h6>
            </div>
          </div>

          {/* Основной текст */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-h4 mb-4 text-gray-800">Основной текст (оптимизирован для чтения)</h3>
            <div className="space-y-4">
              <p className="text-body-lg font-smooth text-gray-700">
                Крупный текст для важного контента (.text-body-lg). 
                Идеально подходит для лендингов и важных описаний. 
                Размер адаптируется от 16px на мобильных до 20px на больших экранах.
              </p>
              <p className="text-body font-smooth text-gray-600">
                Обычный основной текст (.text-body). 
                Стандартный размер для большинства контента. 
                Размер от 14px на мобильных до 18px на десктопах.
              </p>
              <p className="text-body-sm font-smooth text-gray-500">
                Мелкий текст (.text-body-sm) для дополнительной информации и подписей. 
                Остается читаемым на всех устройствах благодаря rem-единицам.
              </p>
              <p className="text-readable font-smooth text-gray-700">
                Специальный текст для максимальной читаемости (.text-readable). 
                Оптимизированный размер и межстрочный интервал для длинных статей и блогов.
              </p>
            </div>
          </div>

          {/* Вспомогательный текст */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-h4 mb-4 text-gray-800">Вспомогательный текст</h3>
            <div className="space-y-3">
              <p className="text-caption font-smooth text-gray-500">
                ПОДПИСЬ (.text-caption) - для подписей к изображениям и мелких деталей
              </p>
              <p className="text-overline font-smooth text-gray-600">
                НАДПИСЬ (.text-overline) - для навигации и категорий
              </p>
            </div>
          </div>

          {/* Читаемость */}
          <div>
            <h3 className="text-h4 mb-4 text-gray-800">Утилиты читаемости</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-h6 mb-2 text-gray-700">Сглаживание шрифтов</h4>
                <p className="text-body font-smooth text-gray-600">
                  Текст с font-smooth - улучшенное отображение на всех экранах
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-h6 mb-2 text-gray-700">Сбалансированный текст</h4>
                <p className="text-body text-balance text-gray-600">
                  Заголовок с text-balance для равномерного распределения слов по строкам
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-h6 mb-2 text-gray-700">Межстрочный интервал</h4>
                <p className="text-body leading-relaxed text-gray-600">
                  Текст с увеличенным leading-relaxed для улучшения читаемости длинного контента.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-h6 mb-2 text-gray-700">Адаптивность</h4>
                <p className="text-body-sm text-gray-500">
                  📱 14px → 📟 16px → 💻 18px
                  <br />
                  Автоматически масштабируется
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="mb-12">
        <h2 className="text-h2 font-semibold mb-6 text-gray-900">Кнопки</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          
          <div className="mb-6">
            <h3 className="text-body-lg font-medium mb-4">Основные кнопки</h3>
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-light transition-colors font-medium">
                Основная кнопка
              </button>
              <button className="px-6 py-3 bg-brand-yellow text-brand rounded-lg hover:bg-brand-yellow-light transition-colors font-medium">
                Желтая кнопка
              </button>
              <button className="px-6 py-3 bg-brand-accent text-white rounded-lg hover:bg-brand-accent-light transition-colors font-medium">
                Акцентная кнопка
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-body-lg font-medium mb-4">Вторичные кнопки</h3>
            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3 border-2 border-brand text-brand rounded-lg hover:bg-brand hover:text-white transition-colors font-medium">
                Контурная кнопка
              </button>
              <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                Серая кнопка
              </button>
              <button className="px-6 py-3 text-brand underline hover:text-brand-light transition-colors font-medium">
                Текстовая кнопка
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-body-lg font-medium mb-4">Размеры кнопок</h3>
            <div className="flex flex-wrap items-center gap-4">
              <button className="px-3 py-1 bg-brand text-white rounded text-body-sm font-medium">Маленькая</button>
              <button className="px-4 py-2 bg-brand text-white rounded font-medium">Средняя</button>
              <button className="px-6 py-3 bg-brand text-white rounded-lg font-medium">Большая</button>
              <button className="px-8 py-4 bg-brand text-white rounded-xl text-body-lg font-medium">Очень большая</button>
            </div>
          </div>
        </div>
      </section>

      {/* Forms */}
      <section className="mb-12">
        <h2 className="text-h2 font-semibold mb-6 text-gray-900">Формы</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          
          <div className="mb-6">
            <h3 className="text-body-lg font-medium mb-4">Поля ввода</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-body-sm font-medium text-gray-700 mb-2">Имя</label>
                <input 
                  type="text" 
                  placeholder="Введите ваше имя"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-gray-700 mb-2">Телефон</label>
                <input 
                  type="tel" 
                  placeholder="+380 XX XXX XX XX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-body-sm font-medium text-gray-700 mb-2">Сообщение</label>
                <textarea 
                  placeholder="Ваше сообщение"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-body-lg font-medium mb-4">Селекты и чекбоксы</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-body-sm font-medium text-gray-700 mb-2">Возрастная категория</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition-colors">
                  <option>Выберите возраст</option>
                  <option>0-2 года</option>
                  <option>3-5 лет</option>
                  <option>6-8 лет</option>
                  <option>9-12 лет</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  id="agreement" 
                  className="w-4 h-4 text-brand-accent border-gray-300 rounded focus:ring-brand-accent"
                />
                <label htmlFor="agreement" className="text-body-sm text-gray-700">
                  Я согласен с условиями использования
                </label>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <input type="radio" id="mini" name="plan" className="text-brand-accent border-gray-300 focus:ring-brand-accent" />
                  <label htmlFor="mini" className="text-body-sm text-gray-700">План &quot;Мини&quot;</label>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="radio" id="maxi" name="plan" className="text-brand-accent border-gray-300 focus:ring-brand-accent" />
                  <label htmlFor="maxi" className="text-body-sm text-gray-700">План &quot;Макси&quot;</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="mb-12">
        <h2 className="text-h2 font-semibold mb-6 text-gray-900">Карточки</h2>
        
        <div className="mb-6">
          <h3 className="text-body-lg font-medium mb-4">Карточки книг</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="w-full h-48 bg-gray-200 rounded-t-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Обложка книги</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">Название книги {i + 1}</h3>
                  <p className="text-body-sm text-gray-600 mb-2">Автор книги</p>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-yellow font-semibold">299 ₴</span>
                    <button className="px-3 py-1 bg-brand text-white text-caption rounded-2xl hover:bg-brand-light transition-colors">
                      Читати
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section className="mb-12">
        <h2 className="text-h2 font-semibold mb-6 text-gray-900">Уведомления</h2>
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            <strong>Успех!</strong> Операция выполнена успешно.
          </div>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
            <strong>Внимание!</strong> Проверьте введенные данные.
          </div>
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <strong>Ошибка!</strong> Что-то пошло не так.
          </div>
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
            <strong>Информация:</strong> Полезная информация для пользователя.
          </div>
        </div>
      </section>

      {/* Loading States */}
      <section className="mb-12">
        <h2 className="text-h2 font-semibold mb-6 text-gray-900">Состояния загрузки</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-4 mb-4">
            <div className="animate-spin rounded-2xl h-8 w-8 border-b-2 border-brand"></div>
            <span className="text-gray-600">Загружаются данные...</span>
          </div>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-2xl bg-gray-300 h-10 w-10"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-40"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
            <span className="text-gray-600">Skeleton loading</span>
          </div>

          <button className="px-6 py-3 bg-brand text-white rounded-lg opacity-50 cursor-not-allowed flex items-center space-x-2">
            <div className="animate-spin rounded-2xl h-4 w-4 border-b-2 border-white"></div>
            <span>Загрузка...</span>
          </button>
        </div>
      </section>

      {/* CSS Variables Test */}
      <section className="mb-12">
        <h2 className="text-h2 font-semibold mb-6 text-gray-900">CSS Переменные</h2>
        <div className="space-y-4">
          <div style={{ backgroundColor: 'var(--brand)', color: 'white' }} className="p-4 rounded-lg">
            CSS Variable --brand (#0B1220)
          </div>
          <div style={{ backgroundColor: 'var(--brand-yellow)', color: 'var(--brand)' }} className="p-4 rounded-lg">
            CSS Variable --brand-yellow (#eab308)
          </div>
          <div style={{ backgroundColor: 'var(--accent)', color: 'white' }} className="p-4 rounded-lg">
            CSS Variable --accent (#2563eb)
          </div>
        </div>
      </section>
    </div>
  );
}