// jest-dom adds custom matchers for asserting on DOM nodes.
// https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/vitest"

// --- jsdom polyfills for browser APIs used by third-party UI libs ---
// (swiper, react-awesome-reveal)

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

class MockObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

if (!window.IntersectionObserver) {
  window.IntersectionObserver = MockObserver
}
if (!window.ResizeObserver) {
  window.ResizeObserver = MockObserver
}
