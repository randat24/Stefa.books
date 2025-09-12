"use client";

import PlansLite from "@/components/widgets/PlansLite";
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function SubscribePage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--app-bg)' }}>
      <div className="section-sm">
        <div className="container">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-small text-text-muted">
              <Link href="/" className="hover:text-text transition-colors">Головна</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-text font-medium">Підписка</span>
            </nav>
          </div>
          
          {/* Тарифні плани */}
          <PlansLite />
        </div>
      </div>
    </main>
  );
}