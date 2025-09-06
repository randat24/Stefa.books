import '@testing-library/jest-dom'
import React from 'react'

// Mock next/head
jest.mock('next/head', () => {
  return function Head({ children }: { children: React.ReactNode }) {
    return React.createElement(React.Fragment, null, children)
  }
})

// Mock next/image
jest.mock('next/image', () => {
  return function Image({ src, alt, ...props }: any) {
    return React.createElement('img', { src, alt, ...props })
  }
})

// Mock IntersectionObserver
global.IntersectionObserver = class MockIntersectionObserver implements IntersectionObserver {
  root = null
  rootMargin = ''
  thresholds = []
  
  constructor(private callback: IntersectionObserverCallback, private options?: IntersectionObserverInit) {}
  
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] { return [] }
} as any

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
