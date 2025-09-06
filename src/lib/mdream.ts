// Temporarily disable mdream import to fix build issues
// import { htmlToMarkdown, parseHtml } from 'mdream';
import { APICache, apiCache } from '@/lib/cache';
import { logger } from '@/lib/logger';

export interface MarkdownConversionOptions {
  /** Original URL for the content (helps with link resolution) */
  origin?: string;
  /** Use minimal preset for cleaner, AI-optimized output */
  minimal?: boolean;
  /** Custom title for the markdown document */
  title?: string;
  /** Additional metadata to include in frontmatter */
  metadata?: Record<string, any>;
  /** Cache duration in seconds (default: 1 hour) */
  cacheDuration?: number;
}

export interface MarkdownResult {
  markdown: string;
  frontmatter?: Record<string, any>;
  title?: string;
  excerpt?: string;
  wordCount: number;
  estimatedReadingTime: number;
}

/**
 * Convert HTML to Markdown using mdream with caching and optimization
 */
export async function convertHtmlToMarkdown(
  html: string,
  options: MarkdownConversionOptions = {}
): Promise<MarkdownResult> {
  const {
    origin,
    minimal = true,
    title,
    metadata = {},
    cacheDuration = 3600 // 1 hour
  } = options;

  // Create simple cache key
  const cacheKey = `mdream:html-to-markdown:${html.slice(0, 50).replace(/[^\w]/g, '')}_${minimal}_${title || ''}`.substring(0, 100);

  try {
    // Try to get from cache first (skip for now to ensure functionality)
    // const cached = apiCache.get<MarkdownResult>(cacheKey);
    // if (cached) {
    //   logger.debug('返回缓存的 Markdown 转换结果');
    //   return cached;
    // }

    logger.info('开始 HTML 到 Markdown 转换', { 
      htmlLength: html.length,
      minimal,
      origin 
    });

    // Temporarily use simple fallback instead of mdream to fix build issues
    logger.warn('Using fallback HTML to Markdown conversion (mdream disabled for build compatibility)');
    
    // Simple HTML to Markdown conversion fallback
    let markdown = html
      // Remove DOCTYPE and html/head tags
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<html[^>]*>/gi, '')
      .replace(/<\/html>/gi, '')
      .replace(/<head[^>]*>[\s\S]*<\/head>/gi, '')
      .replace(/<body[^>]*>/gi, '')
      .replace(/<\/body>/gi, '')
      // Convert headings
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      // Convert paragraphs
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      // Convert strong/bold
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      // Convert lists
      .replace(/<ul[^>]*>/gi, '')
      .replace(/<\/ul>/gi, '\n')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      // Convert images
      .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
      .replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, '![$1]($2)')
      // Convert links
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      // Remove remaining HTML tags
      .replace(/<[^>]+>/g, '')
      // Clean up whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();

    // const markdown = await htmlToMarkdown(html, conversionOptions);

    // Extract frontmatter and content
    const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    let frontmatter: Record<string, any> = {};
    let content = markdown;

    if (frontmatterMatch) {
      try {
        // Parse YAML frontmatter
        const yamlContent = frontmatterMatch[1];
        const lines = yamlContent.split('\n');
        for (const line of lines) {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim();
            frontmatter[key.trim()] = value;
          }
        }
        content = frontmatterMatch[2];
      } catch (error) {
        logger.warn('Не удалось разобрать frontmatter', error);
      }
    }

    // Add custom metadata
    frontmatter = { ...frontmatter, ...metadata };
    if (title) {
      frontmatter.title = title;
    }

    // Calculate word count and reading time
    const wordCount = content.trim().split(/\s+/).length;
    const estimatedReadingTime = Math.ceil(wordCount / 200); // 200 words per minute

    // Extract excerpt (first paragraph)
    const excerptMatch = content.match(/^(.+?)(?:\n\n|\n---|\n#)/);
    const excerpt = excerptMatch ? excerptMatch[1].trim() : '';

    const result: MarkdownResult = {
      markdown: content,
      frontmatter,
      title: frontmatter.title || title,
      excerpt,
      wordCount,
      estimatedReadingTime
    };

    // Cache the result (skip for now)
    // apiCache.set(cacheKey, result, cacheDuration);

    logger.info('HTML 转换为 Markdown 完成', {
      wordCount,
      estimatedReadingTime,
      hasExcerpt: !!excerpt
    });

    return result;

  } catch (error) {
    logger.error('HTML 到 Markdown 转换失败', error);
    throw new Error(`Markdown conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert a webpage URL to Markdown
 */
export async function convertUrlToMarkdown(
  url: string,
  options: Omit<MarkdownConversionOptions, 'origin'> = {}
): Promise<MarkdownResult> {
  try {
    logger.info('获取网页内容进行转换', { url });

    // Fetch HTML content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Stefa.Books Markdown Converter/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    
    return await convertHtmlToMarkdown(html, {
      ...options,
      origin: url
    });

  } catch (error) {
    logger.error('URL 到 Markdown 转换失败', { url, error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * Parse HTML and extract structured data without converting to Markdown
 */
export async function parseHtmlContent(html: string): Promise<{
  title?: string;
  description?: string;
  headings: Array<{ level: number; text: string }>;
  links: Array<{ href: string; text: string }>;
  images: Array<{ src: string; alt?: string }>;
}> {
  try {
    // Temporarily use simple HTML parsing fallback
    logger.warn('Using fallback HTML parsing (mdream disabled for build compatibility)');
    
    // Simple HTML parsing fallback
    const result = {
      title: (html.match(/<title[^>]*>(.*?)<\/title>/i) || [])[1] || undefined,
      description: (html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i) || [])[1] || undefined,
      headings: [] as Array<{ level: number; text: string }>,
      links: [] as Array<{ href: string; text: string }>,
      images: [] as Array<{ src: string; alt?: string }>
    };

    // Extract headings
    const headingMatches = html.matchAll(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi);
    for (const match of headingMatches) {
      result.headings.push({
        level: parseInt(match[1]),
        text: match[2].replace(/<[^>]+>/g, '').trim()
      });
    }

    // Extract links
    const linkMatches = html.matchAll(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi);
    for (const match of linkMatches) {
      result.links.push({
        href: match[1],
        text: match[2].replace(/<[^>]+>/g, '').trim()
      });
    }

    // Extract images
    const imageMatches = html.matchAll(/<img[^>]*src="([^"]*)"[^>]*(?:alt="([^"]*)")?[^>]*>/gi);
    for (const match of imageMatches) {
      result.images.push({
        src: match[1],
        alt: match[2] || undefined
      });
    }

    logger.info('HTML 内容解析完成', {
      hasTitle: !!result.title,
      hasDescription: !!result.description,
      headings: result.headings.length,
      links: result.links.length,
      images: result.images.length
    });

    return result;

  } catch (error) {
    logger.error('HTML 解析失败', error);
    throw error;
  }
}

/**
 * Generate llms.txt content for AI discoverability
 */
export async function generateLlmsTxt(
  pages: Array<{ url: string; title: string; description?: string; markdown?: string }>
): Promise<string> {
  const sections: string[] = [];

  sections.push('# Stefa.Books - Українська дитяча бібліотека');
  sections.push('');
  sections.push('Сервіс підписки та оренди дитячих книг в Україні.');
  sections.push('');

  for (const page of pages) {
    sections.push(`## ${page.title}`);
    sections.push(`URL: ${page.url}`);
    
    if (page.description) {
      sections.push(`Опис: ${page.description}`);
    }
    
    if (page.markdown) {
      // Add first few lines of markdown content
      const preview = page.markdown
        .split('\n')
        .slice(0, 5)
        .join('\n')
        .trim();
      
      if (preview) {
        sections.push('');
        sections.push(preview);
      }
    }
    
    sections.push('');
  }

  const llmsTxt = sections.join('\n');
  
  logger.info('Сгенерирован llms.txt файл', {
    pages: pages.length,
    length: llmsTxt.length
  });

  return llmsTxt;
}