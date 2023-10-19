export * from './exports';

import { Integrations as CoreIntegrations } from '@monitor-web/core';

import { WINDOW } from './helpers';
import * as BrowserIntegrations from './integrations';

let windowIntegrations = {};

// This block is needed to add compatibility with the integrations packages when used with a CDN
if (WINDOW.Sentry && WINDOW.Sentry.Integrations) {
  windowIntegrations = WINDOW.Sentry.Integrations;
}

const INTEGRATIONS = {
  ...windowIntegrations,
  ...CoreIntegrations,
  ...BrowserIntegrations,
};

export { INTEGRATIONS as Integrations };

export {
  BrowserTracing,
  defaultRequestInstrumentationOptions,
  instrumentOutgoingRequests,
} from '@monitor-web/tracing';
export type { RequestInstrumentationOptions } from '@monitor-web/tracing';
export {
  addTracingExtensions,
  setMeasurement,
  extractTraceparentData,
  getActiveTransaction,
  spanStatusfromHttpCode,
  trace,
  makeMultiplexedTransport,
  ModuleMetadata,
} from '@monitor-web/core';
export type { SpanStatusType } from '@monitor-web/core';
export type { Span } from '@monitor-web/types';
export { makeBrowserOfflineTransport } from './transports/offline';
export { onProfilingStartRouteTransaction } from './profiling/hubextensions';
export { BrowserProfilingIntegration } from './profiling/integration';
