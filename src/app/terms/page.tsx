import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            Умови використання
          </h1>
          
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">Для сайту Stefa.books</p>
            <p className="text-sm font-semibold text-brand-yellow-dark">Дата набрання чинності: 27 серпня 2025 року</p>
          </div>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Загальні положення</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p> Ці Умови використання (далі — &ldquo;Умови&rdquo;) регулюють порядок користування сервісом Stefa.books — онлайн-платформою оренди книг за підпискою.</p>
                <p> Використовуючи Сайт stefa-books.com.ua (далі — &ldquo;Сайт&rdquo;), ви підтверджуєте свою згоду з цими Умовами.</p>
                <p> Якщо ви не згодні з Умовами — припиніть користування сервісом.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Предмет Угоди</h2>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Stefa.books надає Користувачам можливість:
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4 space-y-2">
                  <li>оформлювати підписку;</li>
                  <li>отримувати книги в оренду;</li>
                  <li>повертати книги у визначених точках видачі (наприклад, у партнерських кафе, поштоматах чи інших локаціях, вказаних на Сайті);</li>
                  <li>переглядати каталог книг онлайн.</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Книги надаються виключно у тимчасове користування (оренду) і залишаються власністю Stefa.books.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Підписка та оплата</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p> Для доступу до книг необхідно оформити підписку (Mini, Maxi або інший тариф).</p>
                <p> Оплата здійснюється шляхом переказу на банківську карту (ПриватБанк, Monobank) або іншими способами, доступними на Сайті.</p>
                <p> Підписка активується після підтвердження оплати.</p>
                <p> Повернення коштів здійснюється згідно з Законом України &ldquo;Про захист прав споживачів&rdquo; протягом 14 днів з моменту оплати за умови відсутності користування послугами.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Видача та повернення книг</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p> Отримання книги здійснюється у визначених точках видачі (наприклад, у партнерському кафе). Адреси та інструкції публікуються на Сайті або надсилаються у повідомленні після замовлення.</p>
                <p> При обміні книги користувач залишає попередню книгу у визначеній точці видачі та отримує нову.</p>
                <p> Користувач зобов&rsquo;язується повернути книгу у строк, встановлений його підпискою (наприклад, 1 книга/місяць для тарифу Mini).</p>
                <p> Якщо книга пошкоджена або не повернута, користувач відшкодовує її вартість.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Права та обов&rsquo;язки сторін</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Stefa.books зобов&rsquo;язується:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>надавати книги у належному стані;</li>
                    <li>інформувати користувачів про статус замовлень і підписок;</li>
                    <li>забезпечувати сервіс та оновлювати каталог.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Користувач зобов&rsquo;язується:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>використовувати книги лише для особистого читання;</li>
                    <li>повертати книги у зазначені строки;</li>
                    <li>не пошкоджувати та не передавати книги третім особам.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Відповідальність</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p> Stefa.books не несе відповідальності за роботу сторонніх сервісів (кафе, поштових служб, платіжних систем).</p>
                <p> Користувач несе відповідальність за збереження отриманих книг.</p>
                <p> У разі втрати чи значного пошкодження книги користувач компенсує її вартість у розмірі ринкової вартості книги на момент пошкодження/втрати, але не більше 500 грн за одну книгу.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Інтелектуальна власність</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p> Весь контент Сайту (Stefa.books) — дизайн, логотипи, тексти, фото книг, програмний код — є власністю сервісу.</p>
                <p> Копіювання чи використання матеріалів без письмової згоди заборонене.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Зміни до Умов</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p> Stefa.books має право змінювати ці Умови у будь-який момент.</p>
                <p> Оновлена редакція публікується на Сайті та набирає чинності з моменту розміщення.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Форс-мажорні обставини</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Сторони звільняються від відповідальності за повне або часткове невиконання своїх зобов&rsquo;язань, якщо це стало наслідком обставин непереборної сили (форс-мажорних обставин), що виникли після укладення цієї Угоди.</p>
                <p>До форс-мажорних обставин належать: стихійні лиха, війна, терористичні акти, громадянські заворушення, дії влади, що унеможливлюють виконання зобов&rsquo;язань за цим договором.</p>
                <p>При настанні форс-мажорних обставин Сторона, яка не може виконати свої зобов&rsquo;язання, зобов&rsquo;язана негайно повідомити іншу Сторону.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Процедура розгляду скарг</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>У випадку виникнення скарг або претензій Користувач може:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Звернутися до нас письмово за контактами, вказаними нижче</li>
                  <li>Подати скаргу до органів захисту прав споживачів</li>
                  <li>Звернутися до суду в порядку, встановленому законодавством</li>
                </ul>
                <p>Ми розглядаємо скарги протягом 10 робочих днів з моменту їх отримання та надаємо письмову відповідь.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Юрисдикція та вирішення спорів</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Ці Умови регулюються та тлумачяться відповідно до законодавства України.</p>
                <p>Усі спори та розбіжності, що можуть виникнути між Сторонами, вирішуються шляхом переговорів. У разі недосягнення згоди спори вирішуються у судовому порядку за місцем реєстрації Адміністратора відповідно до чинного законодавства України.</p>
                <p>Недійсність окремих положень цих Умов не тягне за собою недійсність Умов у цілому.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Контакти</h2>
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="space-y-3">
                  <p className="font-semibold text-gray-900">Stefa.books</p>
                  <div className="space-y-2 text-gray-700">
                    <p><span className="font-medium">Email:</span> info@stefa.books</p>
                    <p><span className="font-medium">Телефон:</span> +38 (063) 856-54-14</p>
                    <p><span className="font-medium">Адреса:</span> м. Миколаїв, вул. Маріупольська 13/2, Україна</p>
                    <p><span className="font-medium">ФОП:</span> Федорова Анастасія Віталіївна</p>
                    <p><span className="font-medium">РНОКПП:</span> 1234567890</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-12 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center justify-center px-8 py-3 bg-brand-yellow text-gray-900 rounded-full hover:bg-brand-yellow-light transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              Повернутися на головну
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}