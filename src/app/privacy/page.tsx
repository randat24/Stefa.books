import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen min-h-screen bg-gradient-to-br from-gray-50 to-white py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            Політика конфіденційності
          </h1>
          
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">Документ для сайту Stefa.books</p>
            <p className="text-sm font-semibold text-brand-yellow-dark">Дата набрання чинності: 27 серпня 2025 року</p>
          </div>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Загальні положення</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ця Політика конфіденційності (далі — &ldquo;Політика&rdquo;) визначає порядок збору, використання, зберігання, обробки та захисту персональних даних користувачів веб-сайту stefa-books.com.ua (далі — &ldquo;Сайт&rdquo;), який належить та адмініструється Федорова Анастасія Віталіївна, РНОКПП 1234567890, що здійснює діяльність за адресою: м. Миколаїв, вул. Маріупольська 13/2, Україна (надалі — &ldquo;Адміністратор&rdquo;, &ldquo;Ми&rdquo;).
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ми поважаємо ваше право на конфіденційність та дотримуємося вимог:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Конституції України</li>
                <li>Закону України «Про захист персональних даних»</li>
                <li>Загального регламенту ЄС про захист даних (GDPR)</li>
                <li>Інших міжнародних нормативів у сфері захисту інформації</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Використовуючи наш Сайт, ви надаєте згоду на обробку ваших персональних даних відповідно до цієї Політики.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Які дані ми збираємо</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ми можемо збирати наступні категорії персональних даних:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ідентифікаційні дані</h3>
                  <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                    <li>Ім&rsquo;я, прізвище, по батькові</li>
                    <li>Логін, нікнейм або Telegram/Instagram username</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Контактні дані</h3>
                  <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                    <li>Номер телефону</li>
                    <li>Адреса електронної пошти</li>
                    <li>Адреса для самовивозу</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Платіжні дані</h3>
                  <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                    <li>Реквізити для оплати (не зберігаються у нас, але можуть оброблятись платіжними системами)</li>
                    <li>Факти підтвердження оплати (чек, скріншот)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Дані для користування сервісом</h3>
                  <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                    <li>Вибраний тариф/підписка</li>
                    <li>Перелік замовлених або орендованих книг</li>
                    <li>Історія оренди</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Технічні дані</h3>
                  <ul className="list-disc list-inside text-gray-700 ml-4 space-y-1">
                    <li>IP-адреса, cookies, дані браузера</li>
                    <li>Дані щодо дій користувача на Сайті (лог-файли, аналітика)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Мета обробки персональних даних</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ми обробляємо ваші дані з наступними цілями:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Надавати послуги оренди книг та управління підписками</li>
                <li>Забезпечувати доставку/повернення книг</li>
                <li>Ідентифікувати користувача при вході в акаунт</li>
                <li>Виконувати договірні зобов&rsquo;язання</li>
                <li>Обробляти платежі та формувати бухгалтерську звітність</li>
                <li>Інформувати про статус підписки, новинки, акції (маркетинг з вашої згоди)</li>
                <li>Забезпечувати технічну підтримку та покращення сервісу</li>
                <li>Виконувати вимоги законодавства України</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Правові підстави для обробки даних</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Обробка ваших даних здійснюється на підставі:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>вашої згоди;</li>
                <li>необхідності виконання договору (надання послуг оренди книг);</li>
                <li>законних інтересів Адміністратора (покращення роботи сервісу);</li>
                <li>виконання законних вимог державних органів.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Як ми зберігаємо та захищаємо дані</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Дані зберігаються на захищених серверах (використовуються Supabase, Cloudinary, Vercel).</li>
                <li>Застосовуються шифрування, SSL-сертифікати, RLS-політики.</li>
                <li>Доступ до даних мають лише уповноважені співробітники за принципом «мінімально необхідних прав».</li>
                <li>Дані зберігаються не довше, ніж це необхідно для досягнення цілей обробки.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Розкриття інформації третім особам</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ми можемо передавати ваші персональні дані третім особам лише у наступних випадках:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>за вашою згодою;</li>
                <li>у разі використання сторонніх сервісів (платіжні системи, сервіси доставки, хостинг-провайдери);</li>
                <li>на вимогу уповноважених органів державної влади відповідно до законодавства.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ваші права як суб&rsquo;єкта персональних даних</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ви маєте право:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>отримувати інформацію про обробку своїх даних;</li>
                <li>доступ до своїх персональних даних;</li>
                <li>вимагати виправлення неточних або застарілих даних;</li>
                <li>вимагати видалення своїх даних («право на забуття»);</li>
                <li>обмежити або заперечити обробку своїх даних;</li>
                <li>відкликати свою згоду в будь-який момент;</li>
                <li>подати скаргу до Уповноваженого ВРУ з прав людини або до суду.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Використання cookies та аналітики</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ми використовуємо cookies та аналітичні інструменти (Google Analytics, Supabase logs) для:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>збору статистики використання Сайту;</li>
                <li>збереження ваших налаштувань;</li>
                <li>персоналізації контенту.</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Ви можете відключити cookies у налаштуваннях браузера, але це може вплинути на роботу сервісу.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Міжнародна передача даних</h2>
              <p className="text-gray-700 leading-relaxed">
                У випадку передачі персональних даних за межі України (зокрема, при використанні сервісів Supabase, Vercel, Cloudinary), ми забезпечуємо адекватний рівень захисту таких даних шляхом укладання договорів про обробку персональних даних (Data Processing Agreements) та застосування технічних і організаційних заходів захисту.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Відповідальність</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ми несемо відповідальність за збереження ваших персональних даних, але не відповідаємо за:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>технічні збої сторонніх сервісів;</li>
                <li>випадки, коли ви самостійно розкрили свої дані третім особам;</li>
                <li>непереборні обставини (форс-мажор).</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Зміни до Політики</h2>
              <p className="text-gray-700 leading-relaxed">
                Ми можемо оновлювати цю Політику. Всі зміни публікуються на Сайті з новою датою набрання чинності. Якщо зміни суттєві — ми додатково повідомимо користувачів (email/повідомлення у чат-боті).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Процедура розгляду скарг</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>У випадку виникнення скарг щодо обробки персональних даних ви можете:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Звернутися до нас за контактами, вказаними нижче</li>
                  <li>Подати скаргу до Уповноваженого Верховної Ради України з прав людини</li>
                  <li>Звернутися до суду в порядку, встановленому законодавством України</li>
                </ul>
                <p>Ми розглядаємо всі скарги протягом 30 календарних днів з моменту їх отримання.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Юрисдикція та вирішення спорів</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>Ця Політика регулюється законодавством України. Всі спори, що можуть виникнути у зв&rsquo;язку з обробкою персональних даних, вирішуються у порядку, встановленому чинним законодавством України.</p>
                <p>Місцем вирішення спорів є компетентні суди України відповідно до правил підсудності.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Контакти</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Якщо у вас виникли питання щодо захисту даних — звертайтеся:
              </p>
              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="space-y-3">
                  <p className="font-semibold text-gray-900">Stefa.books</p>
                  <div className="space-y-2 text-gray-700">
                    <p><span className="font-medium">Email:</span> info@stefa.books</p>
                    <p><span className="font-medium">Телефон:</span> +38 (063) 856-54-14</p>
                    <p><span className="font-medium">Адреса:</span> м. Миколаїв, вул. Маріупольська 13/2, Україна</p>
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