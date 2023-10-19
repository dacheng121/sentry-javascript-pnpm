import type { Transaction } from '@monitor-web/types';

import type { Hub } from '../hub';
import { getCurrentHub } from '../hub';

/**
 * The `extractTraceparentData` function and `TRACEPARENT_REGEXP` constant used
 * to be declared in this file. It was later moved into `@monitor-web/utils` as part of a
 * move to remove `@monitor-web/tracing` dependencies from `@monitor-web/node` (`extractTraceparentData`
 * is the only tracing function used by `@monitor-web/node`).
 *
 * These exports are kept here for backwards compatability's sake.
 *
 * TODO(v7): Reorganize these exports
 *
 * See https://github.com/getsentry/sentry-javascript/issues/4642 for more details.
 */
export { TRACEPARENT_REGEXP, extractTraceparentData } from '@monitor-web/utils';

/** Grabs active transaction off scope, if any */
export function getActiveTransaction<T extends Transaction>(maybeHub?: Hub): T | undefined {
  const hub = maybeHub || getCurrentHub();
  const scope = hub.getScope();
  return scope.getTransaction() as T | undefined;
}

// so it can be used in manual instrumentation without necessitating a hard dependency on @monitor-web/utils
export { stripUrlQueryAndFragment } from '@monitor-web/utils';
