import { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Контакти | Stefa.books",
  description: "Зв'яжіться з нами для консультації, підтримки або співпраці. Телефон, email та інші способи зв'язку.",
  openGraph: {
    title: "Контакти | Stefa.books",
    description: "Зв'яжіться з нами для консультації, підтримки або співпраці." } };

const breadcrumbItems = [
  { label: "Головна", href: "/" },
  { label: "Контакти", current: true }
];

const contactInfo = [
  {
    icon: Phone,
    title: "Телефон",
    value: "+38 (073) 408 56 60",
    href: "tel:+380734085660"
  },
  {
    icon: Mail,
    title: "Email",
    value: "info@stefa.books",
    href: "mailto:info@stefa.books"
  },
  {
    icon: MapPin,
    title: "Адреса",
    value: "м. Миколаїв, вул. Маріупольська 13/2",
    href: "#"
  },
  {
    icon: Clock,
    title: "Графік роботи",
    value: "Пн-Пт: 9:00-18:00, Сб: 10:00-16:00",
    href: "#"
  }
];

export default function ContactPage() {
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
            Контакти
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Зв&apos;яжіться з нами для консультації, підтримки або співпраці
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Контактна інформація
              </h2>
              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-amber-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.title}
                      </h3>
                      <a
                        href={item.href}
                        className="text-amber-600 hover:text-amber-700 transition-colors"
                      >
                        {item.value}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Соціальні мережі
              </h3>
              <div className="flex space-x-4">
                <a
                  href="https://instagram.com/stefa.books"
                  className="text-gray-600 hover:text-amber-600 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
                <a
                  href="https://facebook.com/stefa.books"
                  className="text-gray-600 hover:text-amber-600 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Надішліть нам повідомлення
            </h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Ім&apos;я *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Тема
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Виберіть тему</option>
                  <option value="general">Загальні питання</option>
                  <option value="subscription">Підписка</option>
                  <option value="rental">Оренда книг</option>
                  <option value="technical">Технічна підтримка</option>
                  <option value="partnership">Співпраця</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Повідомлення *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Опишіть ваше питання або пропозицію..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Надіслати повідомлення</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
