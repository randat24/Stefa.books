import { logger } from './logger';

export async function registerServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    logger.debug('Service Worker not supported', undefined, 'SW');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    
    logger.info('Service Worker registered successfully', { scope: registration.scope }, 'SW');

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      logger.info('Service Worker update found', undefined, 'SW');
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available, show update notification
            showUpdateNotification();
          }
        });
      }
    });

  } catch (error) {
    logger.error('Service Worker registration failed', error, 'SW');
  }
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const unregistered = await registration.unregister();
      logger.info('Service Worker unregistered', { success: unregistered }, 'SW');
      return unregistered;
    }
    return false;
  } catch (error) {
    logger.error('Service Worker unregistration failed', error, 'SW');
    return false;
  }
}

function showUpdateNotification(): void {
  // Create a simple notification that a new version is available
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div id="sw-update-notification" 
         style="position: fixed; top: 20px; right: 20px; z-index: 9999; 
                background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; 
                padding: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); 
                max-width: 300px;">
      <div style="font-weight: 600; margin-bottom: 8px;">Доступна нова версія</div>
      <div style="font-size: 14px; color: #64748b; margin-bottom: 12px;">
        Оновіть сторінку, щоб використати найновішу версію.
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="sw-update-btn" 
                style="background: #3b82f6; color: white; border: none; 
                       padding: 6px 12px; border-radius: 4px; font-size: 12px; 
                       cursor: pointer;">
          Оновити
        </button>
        <button id="sw-dismiss-btn"
                style="background: transparent; color: #64748b; border: 1px solid #e2e8f0; 
                       padding: 6px 12px; border-radius: 4px; font-size: 12px; 
                       cursor: pointer;">
          Пізніше
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Handle update button click
  const updateBtn = document.getElementById('sw-update-btn');
  if (updateBtn) {
    updateBtn.addEventListener('click', () => {
      window.location.reload();
    });
  }

  // Handle dismiss button click
  const dismissBtn = document.getElementById('sw-dismiss-btn');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      const notificationEl = document.getElementById('sw-update-notification');
      if (notificationEl) {
        notificationEl.remove();
      }
    });
  }

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    const notificationEl = document.getElementById('sw-update-notification');
    if (notificationEl) {
      notificationEl.remove();
    }
  }, 10000);
}

export async function checkServiceWorkerUpdate(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      logger.debug('Service Worker update check completed', undefined, 'SW');
    }
  } catch (error) {
    logger.error('Service Worker update check failed', error, 'SW');
  }
}

export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

export async function getServiceWorkerStatus(): Promise<{
  supported: boolean;
  registered: boolean;
  controller: boolean;
}> {
  const supported = isServiceWorkerSupported();
  
  if (!supported) {
    return { supported: false, registered: false, controller: false };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    const registered = !!registration;
    const controller = !!navigator.serviceWorker.controller;

    return { supported, registered, controller };
  } catch (error) {
    logger.error('Error checking Service Worker status', error, 'SW');
    return { supported, registered: false, controller: false };
  }
}