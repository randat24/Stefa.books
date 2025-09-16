import { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BookOpen, Users, Heart, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Про нас - Дитяча бібліотека Stefa.books у Миколаєві",
  description: "Дізнайтеся більше про Stefa.books - платформу для оренди та підписки на українські дитячі книги. Великий асортимент, сімейний сервіс, безпечна доставка по Миколаєву.",
  keywords: [
    'дитяча бібліотека Миколаїв',
    'оренда книг',
    'українські книги для дітей',
    'підписка на дитячі книги',
    'доставка книг Миколаїв'
  ],
  openGraph: {
    title: "Про нас - Дитяча бібліотека Stefa.books у Миколаєві",
    description: "Дізнайтеся більше про Stefa.books - платформу для оренди та підписки на українські дитячі книги. Великий асортимент, сімейний сервіс, безпечна доставка по Миколаєву.",
    images: [
      {
        url: '/images/about-us-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Stefa.books - Дитяча бібліотека у Миколаєві'
      }
    ],
  },
};

const breadcrumbItems = [
  { label: "Головна", href: "/" },
  { label: "Про нас", current: true }
];

const features = [
  {
    icon: BookOpen,
    title: "Великий асортимент",
    description: "Понад 100 українських дитячих книг для різних вікових категорій"
  },
  {
    icon: Users,
    title: "Сімейний сервіс",
    description: "Створено батьками для батьків та їх дітей"
  },
  {
    icon: Heart,
    title: "Любов до читання",
    description: "Прищеплюємо дітям любов до української літератури"
  },
  {
    icon: Shield,
    title: "Безпека",
    description: "Всі книги проходять ретельну перевірку та санітарну обробку"
  }
];

const values = [
  {
    title: "Наша місія",
    content: "Ми прагнемо зробити українські дитячі книги доступними для всіх сімей, прищеплюючи любов до читання з раннього віку."
  },
  {
    title: "Наші цінності",
    content: "Якість, доступність, сімейність та підтримка української літератури - це основні принципи нашої роботи."
  },
  {
    title: "Наша історія",
    content: "Stefa.books створено у 2024 році батьками, які хотіли надати своїм дітям доступ до якісної української літератури за доступною ціною."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Про нас
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stefa.books - це платформа для оренди та підписки на українські дитячі книги
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-4">
                <feature.icon className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="space-y-8 mb-16">
          {values.map((value, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {value.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {value.content}
              </p>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Зв&apos;яжіться з нами
          </h3>
          <p className="text-gray-600 mb-6">
            Маєте питання або пропозиції? Ми завжди раді спілкуванню!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200"
            >
              Зв&apos;язатися з нами
            </a>
            <a
              href="tel:+380734085660"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              +38 (073) 408 56 60
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
