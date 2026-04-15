/**
 * Mock Adapter
 *
 * Intercepta llamadas API y devuelve datos mock cuando no hay backend.
 * Cuando el cliente provea el backend, solo cambia EXPO_PUBLIC_USE_MOCKS=false
 * en el archivo .env.
 */

const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS !== 'false';

export function withMock<T>(
  realFn: () => Promise<T>,
  mockFn: () => T | Promise<T>,
): Promise<T> {
  if (USE_MOCKS) {
    // Simulate network latency
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockFn() as T), 300 + Math.random() * 400),
    );
  }
  return realFn();
}
