const JSDOMEnvironment = require('jest-environment-jsdom').default;

class CustomTestEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context);

    // Add fetch and related APIs to global
    this.global.fetch = fetch;
    this.global.Headers = Headers;
    this.global.Request = Request;
    this.global.Response = Response;
  }

  async setup() {
    await super.setup();
    
    // Create mock functions
    const mockFn = () => {
      const f = (...args) => {
        f.mock.calls.push(args);
        if (f.mockImplementation) {
          const result = f.mockImplementation(...args);
          f.mock.results.push({ type: 'return', value: result });
          return result;
        }
        return undefined;
      };
      f.mock = {
        calls: [],
        results: [],
        instances: [],
        mockImplementation: (impl) => {
          f.mockImplementation = impl;
          return f;
        },
      };
      return f;
    };

    // Add jest mock function to global
    this.global.jest = {
      fn: mockFn,
    };

    // Mock window.matchMedia
    Object.defineProperty(this.global.window, 'matchMedia', {
      writable: true,
      value: mockFn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: mockFn(),
        removeListener: mockFn(),
        addEventListener: mockFn(),
        removeEventListener: mockFn(),
        dispatchEvent: mockFn(),
      })),
    });

    // Mock IntersectionObserver
    const mockIntersectionObserver = mockFn();
    mockIntersectionObserver.mockImplementation(() => ({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    }));
    this.global.IntersectionObserver = mockIntersectionObserver;

    // Mock ResizeObserver
    const mockResizeObserver = mockFn();
    mockResizeObserver.mockImplementation(() => ({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    }));
    this.global.ResizeObserver = mockResizeObserver;
  }
}

module.exports = CustomTestEnvironment;
