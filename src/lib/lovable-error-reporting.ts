// Reports client-side render errors to the console (and the Lovable preview
// bridge when it is available).
export function reportLovableError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  try {
    console.error("[lovable] client error", error, context ?? {});
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("lovable:error", { detail: { error, context: context ?? {} } }),
      );
    }
  } catch {
    /* never let error reporting throw */
  }
}
