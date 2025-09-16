import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Metadata } from "next";
// import { LazySection } from "@/components/ui/LazySection";
import { HomepageResourcePreloader } from "@/components/performance/ResourcePreloader";
import { initWebVitals } from "@/lib/web-vitals";
import { initServiceWorker } from "@/lib/service-worker";

export const dynamicMode = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Stefa.books - Дитяча бібліотека книг з підпискою та орендою';
  const description = 'Орендуйте та читайте українські дитячі книги онлайн. Великий каталог українських дитячих книг для різних вікових категорій. Підписка та окрема оренда книг.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'uk_UA',
      url: 'https://stefa-books.com.ua',
      siteName: 'Stefa.books',
      images: [
        {
          url: '/images/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Stefa.books - Дитяча бібліотека книг'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/og-image.jpg'],
    }
  };
}

// Critical components - load immediately
const Hero = dynamic(() => import("@/components/hero/Hero"));
const Steps = dynamic(() => import("@/components/sections/Steps"));

// Non-critical components - lazy load with intersection observer
const PlansLite = dynamic(() => import("@/components/widgets/PlansLite"));
const Categories = dynamic(() => import("@/components/sections/Categories"));
const SubscribeFormHome = dynamic(() => import("@/components/subscribe/SubscribeFormHome"));
const FAQ = dynamic(() => import("@/components/sections/FAQ"));
const FinalCTA = dynamic(() => import("@/components/sections/FinalCTA"));
const ContactLocation = dynamic(() => import("@/components/sections/ContactLocation"));
const Catalog = dynamic(() => import("@/components/sections/Catalog").then(mod => ({ default: mod.Catalog })));

export default function HomePage() {
	// Initialize Web Vitals monitoring
	if (typeof window !== 'undefined') {
		initWebVitals();
		// Initialize Service Worker
		initServiceWorker({
			enabled: true,
			updateInterval: 30000 // Check for updates every 30 seconds
		});
	}

	return (
		<>
			{/* Resource Preloader for Core Web Vitals optimization */}
			<HomepageResourcePreloader />

			{/* Hero - Critical above-the-fold content */}
			<Suspense fallback={<div className="h-96 bg-surface animate-pulse rounded-lg" />}>
				<Hero />
			</Suspense>

			{/* Steps - Important for conversion */}
			<Suspense fallback={<div className="h-64 bg-surface animate-pulse rounded-lg" />}>
				<Steps />
			</Suspense>

			{/* Categories - Below the fold, lazy load */}
			<Suspense fallback={<div className="h-64 bg-surface animate-pulse rounded-lg" />}>
				<Categories />
			</Suspense>

			{/* Каталог книг - Heavy component, lazy load */}
			<Suspense fallback={<div className="h-96 bg-surface animate-pulse rounded-lg" />}>
				<Catalog />
			</Suspense>

			{/* Тарифы - Important for conversion, lazy load */}
			<Suspense fallback={<div className="h-80 bg-surface animate-pulse rounded-lg" />}>
				<PlansLite />
			</Suspense>

			{/* Subscribe Form - Critical for conversion, lazy load */}
			<Suspense fallback={<div className="h-96 bg-surface animate-pulse rounded-lg" />}>
				<SubscribeFormHome />
			</Suspense>

			{/* FAQ - Below the fold, lazy load */}
			<Suspense fallback={<div className="h-80 bg-surface animate-pulse rounded-lg" />}>
				<FAQ />
			</Suspense>

			{/* Contact Location - Below the fold, lazy load */}
			<Suspense fallback={<div className="h-64 bg-surface animate-pulse rounded-lg" />}>
				<ContactLocation />
			</Suspense>

			{/* Final CTA - Below the fold, lazy load */}
			<Suspense fallback={<div className="h-32 bg-surface animate-pulse rounded-lg" />}>
				<FinalCTA />
			</Suspense>
		</>
	)
}