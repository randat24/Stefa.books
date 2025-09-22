/**
 * Figma to Code (F2C) MCP configuration for Stefa.Books project
 * Converts Figma designs to React components with Tailwind CSS
 */

module.exports = {
  // Figma API configuration
  figma: {
    accessToken: process.env.FIGMA_ACCESS_TOKEN,
    // Example file ID - replace with your actual Figma file
    fileId: process.env.FIGMA_FILE_ID || 'your-figma-file-id',
  },

  // Code generation settings
  generation: {
    // Target framework
    framework: 'react',
    typescript: true,

    // Styling approach
    styling: 'tailwind',

    // Component naming convention
    componentNameCase: 'PascalCase',

    // File naming convention
    fileNameCase: 'kebab-case',
  },

  // Stefa.Books specific settings
  project: {
    // Base component directory
    outputDir: './src/components/figma-generated',

    // Ukrainian language support
    locale: 'uk-UA',

    // Design system tokens
    designTokens: {
      // Colors matching Stefa.Books brand
      colors: {
        primary: '#2563eb',      // Blue
        secondary: '#059669',    // Green
        accent: '#dc2626',       // Red
        neutral: '#6b7280',      // Gray
        background: '#ffffff',   // White
        surface: '#f9fafb',      // Light gray
      },

      // Typography scale
      typography: {
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          display: ['Outfit', 'sans-serif'],
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
        }
      },

      // Spacing scale
      spacing: {
        xs: '0.5rem',    // 8px
        sm: '0.75rem',   // 12px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
        xl: '2rem',      // 32px
        '2xl': '3rem',   // 48px
      },

      // Border radius
      borderRadius: {
        sm: '0.25rem',   // 4px
        md: '0.375rem',  // 6px
        lg: '0.5rem',    // 8px
        xl: '0.75rem',   // 12px
        '2xl': '1rem',   // 16px
      }
    },

    // Component patterns specific to book catalog
    patterns: {
      // Book card variations
      bookCard: {
        variants: ['default', 'simple', 'featured'],
        sizes: ['sm', 'md', 'lg'],
        states: ['default', 'hover', 'selected', 'unavailable']
      },

      // Navigation patterns
      navigation: {
        types: ['header', 'breadcrumb', 'pagination', 'category-filter'],
        responsive: true
      },

      // Form patterns
      forms: {
        types: ['subscription', 'search', 'contact', 'rental'],
        validation: 'zod',
        accessibility: true
      },

      // Modal patterns
      modals: {
        types: ['book-preview', 'subscription', 'confirmation'],
        animations: 'framer-motion'
      }
    }
  },

  // Accessibility settings
  accessibility: {
    // Generate ARIA attributes
    generateAria: true,

    // Keyboard navigation support
    keyboardNavigation: true,

    // Screen reader support
    screenReader: true,

    // Color contrast validation
    contrastValidation: true,

    // Focus management
    focusManagement: true
  },

  // Performance optimizations
  performance: {
    // Generate lazy loading components
    lazyLoading: true,

    // Optimize images
    imageOptimization: true,

    // Code splitting
    codeSplitting: true,

    // Tree shaking friendly exports
    namedExports: true
  },

  // Testing configuration
  testing: {
    // Generate test files
    generateTests: true,

    // Testing framework
    framework: 'vitest',

    // Test types to generate
    testTypes: ['unit', 'accessibility', 'visual-regression'],

    // Mock data generation
    generateMocks: true
  },

  // Quality checks
  quality: {
    // ESLint integration
    eslint: true,

    // TypeScript strict mode
    strictTypes: true,

    // Performance budgets
    performanceBudgets: {
      maxBundleSize: '100kb',
      maxImageSize: '500kb'
    }
  }
};