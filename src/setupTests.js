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

// The test runner's localStorage can be missing or non-functional (Node's
// experimental web storage without a backing file). Provide an in-memory one.
if (typeof window.localStorage?.clear !== "function") {
  const store = new Map()
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (k) => (store.has(String(k)) ? store.get(String(k)) : null),
      setItem: (k, v) => void store.set(String(k), String(v)),
      removeItem: (k) => void store.delete(String(k)),
      clear: () => store.clear(),
      key: (i) => [...store.keys()][i] ?? null,
      get length() {
        return store.size
      },
    },
  })
}
