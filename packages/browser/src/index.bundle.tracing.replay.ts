import { addExtensionMethods, BrowserTracing, Span } from '@monitor-web/tracing';

import * as Sentry from './index.bundle.base';

// TODO (v8): Remove this as it was only needed for backwards compatibility
// We want replay to be available under Sentry.Replay, to be consistent
// with the NPM package version.
// Sentry.Integrations.Replay = Replay;

Sentry.Integrations.BrowserTracing = BrowserTracing;

// We are patching the global object with our hub extension methods
addExtensionMethods();

export { BrowserTracing, Span, addExtensionMethods };
export * from './index.bundle.base';
