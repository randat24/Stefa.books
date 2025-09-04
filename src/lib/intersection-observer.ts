/**
 * Intersection Observer utilities for performance optimization
 */

// Create a single Intersection Observer instance for reuse
let intersectionObserver: IntersectionObserver | null = null;

// Callback map to store element callbacks
let callbackMap = new WeakMap<HTMLElement, () => void>();

// Initialize Intersection Observer with optimized settings
export function initializeIntersectionObserver(): void {
  if (typeof window === 'undefined' || intersectionObserver) return;

  intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const callback = callbackMap.get(element);
          
          if (callback) {
            try {
              console.log('IntersectionObserver: Executing callback for element', element);
              callback();
            } catch (error) {
              console.warn('Error executing observer callback:', error);
            }
          }
          
          // Remove observer after intersection
          intersectionObserver?.unobserve(element);
          callbackMap.delete(element);
        }
      });
    },
    {
      rootMargin: '50px', // Start loading slightly before entering viewport
      threshold: 0.01 // Trigger as soon as 1% is visible
    }
  );
}

// Observe an element with a callback
export function observeElement(
  element: HTMLElement, 
  callback: () => void
): void {
  if (typeof window === 'undefined') {
    console.log('observeElement: Window is undefined, executing callback immediately');
    // Execute immediately in SSR context
    callback();
    return;
  }

  console.log('observeElement: Setting up observer for element', element);

  if (!intersectionObserver) {
    initializeIntersectionObserver();
  }

  // Store callback in map
  callbackMap.set(element, callback);
  intersectionObserver?.observe(element);
}

// Unobserve an element
export function unobserveElement(element: HTMLElement): void {
  if (typeof window === 'undefined' || !intersectionObserver) return;
  intersectionObserver.unobserve(element);
  callbackMap.delete(element);
}

// Cleanup function
export function cleanupIntersectionObserver(): void {
  if (intersectionObserver) {
    intersectionObserver.disconnect();
    intersectionObserver = null;
    callbackMap = new WeakMap();
  }
}

// Utility to lazy load images with Intersection Observer
export function lazyLoadImage(img: HTMLImageElement, src: string): void {
  if (typeof window === 'undefined') return;

  observeElement(img, () => {
    img.src = src;
    img.classList.remove('lazy-loading');
    img.classList.add('lazy-loaded');
  });
}

// Utility to lazy load components
export function lazyLoadComponent(
  placeholder: HTMLElement,
  componentLoader: () => Promise<any>
): void {
  if (typeof window === 'undefined') return;

  observeElement(placeholder, async () => {
    try {
      await componentLoader();
      // Implementation would depend on how components are rendered
    } catch (error) {
      console.warn('Error loading component:', error);
    }
  });
}