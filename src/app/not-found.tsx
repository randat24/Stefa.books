import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, Search } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BreadcrumbStructuredData } from "@/components/seo/BreadcrumbStructuredData";

export const metadata: Metadata = {
  title: "Сторінка не знайдена - 404 | Stefa.books",
  description: "Сторінка, яку ви шукаєте, не існує. Поверніться до головної сторінки або знайдіть потрібну книгу в нашому каталозі.",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Сторінка не знайдена - 404 | Stefa.books",
    description: "Сторінка, яку ви шукаєте, не існує. Поверніться до головної сторінки або знайдіть потрібну книгу в нашому каталозі.",
    type: "website",
  },
};

const breadcrumbItems = [
  { label: "Сторінка не знайдена", current: true }
];

export default function NotFound() {
  return (
    <>
      <BreadcrumbStructuredData items={breadcrumbItems} />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          {/* Breadcrumbs */}
          <div className="mb-8">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          {/* 404 Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-amber-100 rounded-full mb-6">
              <BookOpen className="w-16 h-16 text-amber-600" />
            </div>
            <h1 className="text-6xl font-bold text-amber-600 mb-4">404</h1>
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Сторінка не знайдена
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Вибачте, але сторінка, яку ви шукаєте, не існує або була переміщена.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                На головну
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/catalog">
                <Search className="w-4 h-4 mr-2" />
                Каталог книг
              </Link>
            </Button>
          </div>

          {/* Popular Categories */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Популярні категорії
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Дитячі казки", href: "/catalog/kazky" },
                { name: "Навчальна література", href: "/catalog/navchalna" },
                { name: "Художня література", href: "/catalog/khudozhnya" },
                { name: "Енциклопедії", href: "/catalog/entsyklopediyi" }
              ].map((category) => (
                <Link
                  key={category.href}
                  href={category.href}
                  className="p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors duration-200 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-sm text-gray-500">
            <p>
              Якщо ви вважаєте, що це помилка, будь ласка,{" "}
              <Link href="/contact" className="text-amber-600 hover:underline">
                зв&apos;яжіться з нами
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}