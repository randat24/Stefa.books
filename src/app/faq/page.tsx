import { Metadata } from "next";
import { FAQStructuredData } from "@/components/seo/FAQStructuredData";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BreadcrumbStructuredData } from "@/components/seo/BreadcrumbStructuredData";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, BookOpen, CreditCard, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Часті питання (FAQ) | Stefa.books",
  description: "Відповіді на найчастіші питання про підписку, оренду книг, способи оплати та використання сервісу Stefa.books.",
  keywords: [
    "FAQ",
    "часті питання",
    "підписка на книги",
    "оренда книг",
    "способи оплати",
    "Stefa.books"
  ],
  openGraph: {
    title: "Часті питання (FAQ) | Stefa.books",
    description: "Відповіді на найчастіші питання про підписку, оренду книг, способи оплати та використання сервісу Stefa.books.",
    type: "website",
  },
};

const breadcrumbItems = [
  { label: "FAQ", current: true }
];

const faqs = [
  {
    question: "Як працює підписка на книги?",
    answer: "Підписка дозволяє читати необмежену кількість книг з нашого каталогу за фіксовану щомісячну плату. Ви можете читати книги онлайн або завантажувати їх для офлайн-читання."
  },
  {
    question: "Скільки коштує оренда книги?",
    answer: "Вартість оренди залежить від конкретної книги та тривалості оренди. Зазвичай ціни коливаються від 50 до 200 гривень за тиждень. Точну ціну ви можете побачити на сторінці книги."
  },
  {
    question: "Які вікові категорії книг доступні?",
    answer: "У нас є книги для дітей від 0 до 18 років: для малюків (0-3 роки), дошкільнят (3-6 років), молодших школярів (6-10 років), середніх школярів (10-14 років) та старших школярів (14-18 років)."
  },
  {
    question: "Чи можна скачати книгу для офлайн-читання?",
    answer: "Так, більшість книг доступні для завантаження в форматі PDF або EPUB. Після оренди або підписки ви можете завантажити книгу на свій пристрій для читання без інтернету."
  },
  {
    question: "Як довго триває оренда книги?",
    answer: "Стандартна оренда триває 7 днів, але ви можете вибрати більш тривалий період (14 або 30 днів) за додаткову плату. Після закінчення терміну оренди доступ до книги автоматично припиняється."
  },
  {
    question: "Чи можна повернути гроші за оренду?",
    answer: "Так, ми надаємо повернення коштів протягом 24 годин після початку оренди, якщо ви ще не почали читати книгу. Для повернення зверніться до нашої служби підтримки."
  },
  {
    question: "Які способи оплати ви приймаєте?",
    answer: "Ми приймаємо оплату картками Visa, Mastercard, через Monobank, Privat24, а також електронними грошима. Всі платежі обробляються безпечно через зашифроване з'єднання."
  },
  {
    question: "Чи є обмеження на кількість книг при підписці?",
    answer: "Ні, при підписці ви можете читати необмежену кількість книг з нашого каталогу. Єдине обмеження - одночасно ви можете мати в оренді не більше 5 книг."
  }
];

const faqCategories = [
  {
    title: "Підписка та оренда",
    icon: BookOpen,
    faqs: faqs.slice(0, 3)
  },
  {
    title: "Оплата та повернення",
    icon: CreditCard,
    faqs: faqs.slice(3, 6)
  },
  {
    title: "Технічні питання",
    icon: Download,
    faqs: faqs.slice(6, 8)
  }
];

export default function FAQPage() {
  return (
    <>
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <FAQStructuredData faqs={faqs} />
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumbs */}
          <div className="mb-8">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-6">
              <HelpCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Часті питання
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Знайдіть відповіді на найчастіші питання про наш сервіс оренди та підписки на дитячі книги
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center mb-6">
                  <category.icon className="w-6 h-6 text-amber-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {category.title}
                  </h2>
                </div>
                
                <Accordion type="single" collapsible className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem 
                      key={faqIndex} 
                      value={`${categoryIndex}-${faqIndex}`}
                      className="border border-gray-200 rounded-lg px-4"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="font-medium text-gray-900">
                          {faq.question}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-16 bg-white rounded-lg shadow-sm border p-8 text-center">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Не знайшли відповідь?
            </h3>
            <p className="text-gray-600 mb-6">
              Якщо у вас залишилися питання, ми завжди готові допомогти
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200"
              >
                Зв&apos;язатися з нами
              </a>
              <a
                href="tel:+380638565414"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                +38 (063) 856-54-14
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
