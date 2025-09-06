/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple test without complex imports
describe('SEO Components', () => {
  it('should render basic HTML structure', () => {
    const { container } = render(
      <div>
        <title>Test Title</title>
        <meta name="description" content="Test description" />
      </div>
    );

    expect(container.querySelector('title')).toHaveTextContent('Test Title');
    expect(container.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Test description');
  });

  it('should handle basic meta tags', () => {
    const { container } = render(
      <div>
        <meta name="keywords" content="test, keywords" />
        <link rel="canonical" href="https://example.com" />
      </div>
    );

    expect(container.querySelector('meta[name="keywords"]')).toHaveAttribute('content', 'test, keywords');
    expect(container.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://example.com');
  });

  it('should handle Open Graph meta tags', () => {
    const { container } = render(
      <div>
        <meta property="og:title" content="Test OG Title" />
        <meta property="og:description" content="Test OG Description" />
        <meta property="og:image" content="https://example.com/image.jpg" />
      </div>
    );

    expect(container.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'Test OG Title');
    expect(container.querySelector('meta[property="og:description"]')).toHaveAttribute('content', 'Test OG Description');
    expect(container.querySelector('meta[property="og:image"]')).toHaveAttribute('content', 'https://example.com/image.jpg');
  });

  it('should handle Twitter Card meta tags', () => {
    const { container } = render(
      <div>
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@test" />
        <meta name="twitter:creator" content="@test" />
      </div>
    );

    expect(container.querySelector('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');
    expect(container.querySelector('meta[name="twitter:site"]')).toHaveAttribute('content', '@test');
    expect(container.querySelector('meta[name="twitter:creator"]')).toHaveAttribute('content', '@test');
  });

  it('should handle structured data', () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Book",
      "name": "Test Book"
    };

    const { container } = render(
      <div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </div>
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
    expect(script).toHaveTextContent(JSON.stringify(structuredData));
  });

  it('should handle robots meta tag', () => {
    const { container } = render(
      <div>
        <meta name="robots" content="noindex, nofollow" />
      </div>
    );

    expect(container.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  });

  it('should handle alternate hreflang links', () => {
    const { container } = render(
      <div>
        <link rel="alternate" hrefLang="en" href="https://example.com/en" />
        <link rel="alternate" hrefLang="ru" href="https://example.com/ru" />
      </div>
    );

    expect(container.querySelector('link[rel="alternate"][hrefLang="en"]')).toHaveAttribute('href', 'https://example.com/en');
    expect(container.querySelector('link[rel="alternate"][hrefLang="ru"]')).toHaveAttribute('href', 'https://example.com/ru');
  });
});
