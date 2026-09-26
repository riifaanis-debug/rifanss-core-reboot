// Captures the last unhandled server-side error so the SSR entry can report it
// even when the underlying HTTP layer swallows the original throw.
let lastCapturedError: unknown = undefined;

export function captureError(error: unknown): void {
  lastCapturedError = error;
}

export function consumeLastCapturedError(): unknown {
  const error = lastCapturedError;
  lastCapturedError = undefined;
  return error;
}

const globalScope = globalThis as typeof globalThis & {
  __lovableErrorCaptureInstalled?: boolean;
};

if (!globalScope.__lovableErrorCaptureInstalled) {
  globalScope.__lovableErrorCaptureInstalled = true;

  const originalConsoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    const firstError = args.find((arg) => arg instanceof Error);
    if (firstError) captureError(firstError);
    originalConsoleError(...(args as []));
  };
}
