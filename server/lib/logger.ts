type LogContext = Record<string, string | number | boolean | undefined>;

function sanitize(context: LogContext) {
  return Object.fromEntries(
    Object.entries(context).filter(([, value]) => value !== undefined),
  );
}

export function logInfo(event: string, context: LogContext = {}) {
  console.info(`[lucathi] ${event}`, sanitize(context));
}

export function logError(event: string, context: LogContext = {}) {
  console.error(`[lucathi] ${event}`, sanitize(context));
}
