import '@testing-library/jest-dom';

// Mock crypto.randomUUID for session ID generation
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-1234-5678-9012',
  },
});

// Mock URL.createObjectURL and URL.revokeObjectURL for export tests
// Use native function mocks instead of vi.fn() to avoid importing from vitest in setup file
global.URL.createObjectURL = (() => 'blob:mock-url') as typeof URL.createObjectURL;
global.URL.revokeObjectURL = (() => {}) as typeof URL.revokeObjectURL;
