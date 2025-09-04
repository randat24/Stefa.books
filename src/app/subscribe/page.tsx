"use client";

import PlansLite from "@/components/widgets/PlansLite";
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function SubscribePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-gray-900">Головна</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-gray-900 font-medium">Підписка</span>
            </nav>
          </div>
          
          {/* Тарифні плани */}
          <PlansLite />
        </div>
      </div>
    </main>
  );
}