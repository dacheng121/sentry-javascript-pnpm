export {
  extractTraceparentData,
  getActiveTransaction,
  hasTracingEnabled,
  IdleTransaction,
  Span,
  // eslint-disable-next-line deprecation/deprecation
  SpanStatus,
  spanStatusfromHttpCode,
  startIdleTransaction,
  Transaction,
} from '@monitor-web/core';
export type { SpanStatusType } from '@monitor-web/core';
export { stripUrlQueryAndFragment, TRACEPARENT_REGEXP } from '@monitor-web/utils';
