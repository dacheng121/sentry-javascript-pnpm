import { getCurrentHub } from '@monitor-web/core';
import { logger } from '@monitor-web/utils';

/**
 * Log a message in debug mode, and add a breadcrumb when _experiment.traceInternals is enabled.
 */
export function logInfo(message: string, shouldAddBreadcrumb?: boolean): void {
  if (!__DEBUG_BUILD__) {
    return;
  }

  logger.info(message);

  if (shouldAddBreadcrumb) {
    addBreadcrumb(message);
  }
}

/**
 * Log a message, and add a breadcrumb in the next tick.
 * This is necessary when the breadcrumb may be added before the replay is initialized.
 */
export function logInfoNextTick(message: string, shouldAddBreadcrumb?: boolean): void {
  if (!__DEBUG_BUILD__) {
    return;
  }

  logger.info(message);

  if (shouldAddBreadcrumb) {
    // Wait a tick here to avoid race conditions for some initial logs
    // which may be added before replay is initialized
    setTimeout(() => {
      addBreadcrumb(message);
    }, 0);
  }
}

function addBreadcrumb(message: string): void {
  const hub = getCurrentHub();
  hub.addBreadcrumb(
    {
      category: 'console',
      data: {
        logger: 'replay',
      },
      level: 'info',
      message,
    },
    { level: 'info' },
  );
}
