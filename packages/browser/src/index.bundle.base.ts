export * from './exports';

import { Integrations as CoreIntegrations } from '@monitor-web/core';
import type { Integration } from '@monitor-web/types';

import { WINDOW } from './helpers';
import * as BrowserIntegrations from './integrations';

let windowIntegrations = {};

// This block is needed to add compatibility with the integrations packages when used with a CDN
if (WINDOW.Sentry && WINDOW.Sentry.Integrations) {
  windowIntegrations = WINDOW.Sentry.Integrations;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const INTEGRATIONS: Record<string, new (...args: any[]) => Integration> = {
  ...windowIntegrations,
  ...CoreIntegrations,
  ...BrowserIntegrations,
};

export { INTEGRATIONS as Integrations };
