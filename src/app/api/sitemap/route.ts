import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch all books
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, updated_at, created_at')
      .eq('available', true);

    if (booksError) {
      console.error('Error fetching books for sitemap:', booksError);
      throw booksError;
    }

    // Fetch all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('name, created_at');

    if (categoriesError) {
      console.error('Error fetching categories for sitemap:', categoriesError);
      throw categoriesError;
    }

    // Static pages
    const staticPages = [
      { url: '', priority: 1.0, changefreq: 'daily' }, // Home page
      { url: 'catalog', priority: 0.9, changefreq: 'weekly' },
      { url: 'plans', priority: 0.8, changefreq: 'monthly' },
      { url: 'about', priority: 0.7, changefreq: 'monthly' },
      { url: 'contact', priority: 0.7, changefreq: 'monthly' },
      { url: 'faq', priority: 0.6, changefreq: 'monthly' }
    ];

    // Generate sitemap XML
    const baseUrl = 'https://stefa-books.com.ua';
    const lastMod = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static pages
    staticPages.forEach(page => {
      xml += `
  <url>
    <loc>${baseUrl}/${page.url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Add category pages
    if (categories) {
      categories.forEach((category: any) => {
      const categoryName = category.name?.toLowerCase();
      const categoryLastMod = category.created_at 
        ? new Date(category.created_at).toISOString().split('T')[0]
        : lastMod;
        
      xml += `
  <url>
    <loc>${baseUrl}/categories/${categoryName}</loc>
    <lastmod>${categoryLastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      });
    }

    // Add book pages
    if (books) {
      books.forEach((book: any) => {
      const bookLastMod = book.updated_at 
        ? new Date(book.updated_at).toISOString().split('T')[0]
        : (book.created_at 
          ? new Date(book.created_at).toISOString().split('T')[0]
          : lastMod);
        
      xml += `
  <url>
    <loc>${baseUrl}/books/${book.id}</loc>
    <lastmod>${bookLastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });
    }

    xml += `
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      } });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}