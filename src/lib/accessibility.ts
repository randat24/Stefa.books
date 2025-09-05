/**
 * Утилиты для проверки и улучшения доступности
 */

/**
 * Проверяет, является ли элемент видимым для screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    element.getAttribute('aria-hidden') !== 'true' &&
    element.getAttribute('hidden') !== 'true'
  );
}

/**
 * Проверяет, имеет ли элемент достаточный цветовой контраст
 */
export function hasSufficientContrast(
  foregroundColor: string,
  backgroundColor: string
): boolean {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foregroundColor);
  const l2 = getLuminance(backgroundColor);
  
  const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return contrast >= 4.5; // WCAG AA стандарт
}

/**
 * Конвертирует hex цвет в RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Проверяет, поддерживает ли элемент навигацию с клавиатуры
 */
export function isKeyboardNavigable(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role');
  const tabIndex = element.getAttribute('tabindex');
  
  // Элементы, которые по умолчанию поддерживают клавиатуру
  const keyboardElements = [
    'a', 'button', 'input', 'select', 'textarea', 'details', 'summary'
  ];
  
  // Элементы с role, которые поддерживают клавиатуру
  const keyboardRoles = [
    'button', 'link', 'menuitem', 'tab', 'option', 'checkbox', 'radio'
  ];
  
  return (
    keyboardElements.includes(tagName) ||
    keyboardRoles.includes(role || '') ||
    tabIndex !== null
  );
}

/**
 * Получает все фокусируемые элементы в контейнере
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    'details',
    'summary'
  ];
  
  const elements = container.querySelectorAll(focusableSelectors.join(', '));
  return Array.from(elements).filter(isVisibleToScreenReader) as HTMLElement[];
}

/**
 * Проверяет, имеет ли элемент правильную структуру заголовков
 */
export function hasProperHeadingStructure(container: HTMLElement): boolean {
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const headingLevels: number[] = [];
  
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    headingLevels.push(level);
  });
  
  // Проверяем, что заголовки идут по порядку
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] - headingLevels[i - 1] > 1) {
      return false;
    }
  }
  
  return true;
}

/**
 * Проверяет, есть ли у изображений альтернативный текст
 */
export function hasAltTextForImages(container: HTMLElement): boolean {
  const images = container.querySelectorAll('img');
  
  for (const img of images) {
    const alt = img.getAttribute('alt');
    const role = img.getAttribute('role');
    
    // Изображение должно иметь alt или быть декоративным
    if (!alt && role !== 'presentation') {
      return false;
    }
  }
  
  return true;
}

/**
 * Проверяет, есть ли у форм правильные лейблы
 */
export function hasProperFormLabels(container: HTMLElement): boolean {
  const formControls = container.querySelectorAll('input, select, textarea');
  
  for (const control of formControls) {
    const id = control.getAttribute('id');
    const ariaLabel = control.getAttribute('aria-label');
    const ariaLabelledby = control.getAttribute('aria-labelledby');
    
    // Проверяем, есть ли лейбл
    if (!ariaLabel && !ariaLabelledby) {
      if (id) {
        const label = container.querySelector(`label[for="${id}"]`);
        if (!label) {
          return false;
        }
      } else {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Проверяет доступность компонента
 */
export function checkComponentAccessibility(container: HTMLElement): {
  score: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;
  
  // Проверка контрастности
  const textElements = container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
  textElements.forEach(element => {
    const style = window.getComputedStyle(element);
    const color = style.color;
    const backgroundColor = style.backgroundColor;
    
    if (color && backgroundColor && !hasSufficientContrast(color, backgroundColor)) {
      issues.push(`Недостатній контраст для тексту: ${element.textContent?.slice(0, 50)}...`);
      score -= 10;
    }
  });
  
  // Проверка структуры заголовков
  if (!hasProperHeadingStructure(container)) {
    issues.push('Неправильна структура заголовків');
    score -= 15;
  }
  
  // Проверка изображений
  if (!hasAltTextForImages(container)) {
    issues.push('Зображення без альтернативного тексту');
    score -= 20;
  }
  
  // Проверка форм
  if (!hasProperFormLabels(container)) {
    issues.push('Форми без правильних лейблів');
    score -= 25;
  }
  
  // Проверка клавиатурной навигации
  const interactiveElements = container.querySelectorAll('button, a, input, select, textarea');
  interactiveElements.forEach(element => {
    if (!isKeyboardNavigable(element as HTMLElement)) {
      issues.push(`Елемент не підтримує навігацію з клавіатури: ${element.tagName}`);
      score -= 5;
    }
  });
  
  // Предложения по улучшению
  if (score < 100) {
    suggestions.push('Додайте ARIA атрибути для кращої доступності');
    suggestions.push('Перевірте контрастність кольорів');
    suggestions.push('Додайте альтернативний текст для зображень');
    suggestions.push('Перевірте навігацію з клавіатури');
  }
  
  return {
    score: Math.max(0, score),
    issues,
    suggestions
  };
}

/**
 * Генерирует отчет о доступности
 */
export function generateAccessibilityReport(container: HTMLElement): string {
  const { score, issues, suggestions } = checkComponentAccessibility(container);
  
  let report = `# Звіт про доступність\n\n`;
  report += `**Загальний бал: ${score}/100**\n\n`;
  
  if (issues.length > 0) {
    report += `## Проблеми:\n`;
    issues.forEach((issue, index) => {
      report += `${index + 1}. ${issue}\n`;
    });
    report += `\n`;
  }
  
  if (suggestions.length > 0) {
    report += `## Рекомендації:\n`;
    suggestions.forEach((suggestion, index) => {
      report += `${index + 1}. ${suggestion}\n`;
    });
  }
  
  return report;
}
