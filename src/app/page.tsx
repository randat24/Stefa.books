import { Suspense, lazy } from "react";
import Hero from "@/components/hero/Hero";
import Steps from "@/components/sections/Steps";
import { Metadata } from "next";
import { LazySection } from "@/components/ui/LazySection";
import { HomepageResourcePreloader } from "@/components/performance/ResourcePreloader";
import { initWebVitals } from "@/lib/web-vitals";
import { initServiceWorker } from "@/lib/service-worker";

export const dynamic = 'force-dynamic'

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

// Dynamic imports for non-critical components
const PlansLite = lazy(() => import("@/components/widgets/PlansLite"));
const Categories = lazy(() => import("@/components/sections/Categories"));
const SubscribeFormHome = lazy(() => import("@/components/subscribe/SubscribeFormHome"));
const SocialProof = lazy(() => import("@/components/sections/SocialProof"));
const FAQ = lazy(() => import("@/components/sections/FAQ"));
const FinalCTA = lazy(() => import("@/components/sections/FinalCTA"));
const ContactLocation = lazy(() => import("@/components/sections/ContactLocation"));
const Catalog = lazy(() => import("@/components/sections/Catalog").then(mod => ({ default: mod.Catalog })));
const RecentViews = lazy(() => import("@/components/sections/RecentViews").then(mod => ({ default: mod.RecentViews })));

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
			
			
			{/* Hero */}
			<Hero />
			
			{/* Recent Views */}
			<LazySection>
				<Suspense fallback={<div className="h-32 bg-[var(--surface-2)] animate-pulse rounded-lg" />}>
					<RecentViews maxItems={5} />
				</Suspense>
			</LazySection>

			{/* Categories */}
			<LazySection>
				<Suspense fallback={<div className="h-64 bg-[var(--surface-2)] animate-pulse rounded-lg" />}>
					<Categories />
				</Suspense>
			</LazySection>
			
			{/* Steps */}
			<Steps />

			{/* Каталог книг */}
			<LazySection>
				<Suspense fallback={<div className="h-96 bg-[var(--surface-2)] animate-pulse rounded-lg" />}>
					<Catalog />
				</Suspense>
			</LazySection>

			{/* Тарифы */}
			<LazySection>
				<Suspense fallback={<div className="h-80 bg-[var(--surface-2)] animate-pulse rounded-lg" />}>
					<PlansLite />
				</Suspense>
			</LazySection>

			{/* Subscribe Form */}
			<LazySection>
				<Suspense fallback={<div className="h-96 bg-[var(--surface-2)] animate-pulse rounded-lg" />}>
					<SubscribeFormHome />
				</Suspense>
			</LazySection>

			{/* FAQ */}
			<LazySection>
				<Suspense fallback={<div className="h-80 bg-[var(--surface-2)] animate-pulse rounded-lg" />}>
					<FAQ />
				</Suspense>
			</LazySection>

			{/* Social Proof */}
			<LazySection>
				<Suspense fallback={<div className="h-48 bg-[var(--surface-2)] animate-pulse rounded-lg" />}>
					<SocialProof />
				</Suspense>
			</LazySection>

			{/* Contact Location */}
			<LazySection>
				<Suspense fallback={<div className="h-64 bg-[var(--surface-2)] animate-pulse rounded-lg" />}>
					<ContactLocation />
				</Suspense>
			</LazySection>

			{/* Final CTA */}
			<LazySection>
				<Suspense fallback={<div className="h-32 bg-[var(--surface-2)] animate-pulse rounded-lg" />}>
					<FinalCTA />
				</Suspense>
			</LazySection>
		</>
	)
}