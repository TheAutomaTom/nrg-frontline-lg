// GuidGenerator.ts
// Simple unique ID generator for steps, etc.
export function generateGuid(prefix = "step_") {
  return (
    prefix +
    Date.now().toString(36) +
    "_" +
    Math.random().toString(36).slice(2, 8)
  );
}
