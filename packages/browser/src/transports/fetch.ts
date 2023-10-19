import { createTransport } from '@monitor-web/core';
import type { Transport, TransportMakeRequestResponse, TransportRequest } from '@monitor-web/types';
import { rejectedSyncPromise } from '@monitor-web/utils';

import type { BrowserTransportOptions } from './types';
import type { FetchImpl } from './utils';
import { clearCachedFetchImplementation, getNativeFetchImplementation } from './utils';

/**
 * Creates a Transport that uses the Fetch API to send events to Sentry.
 */
export function makeFetchTransport(
  options: BrowserTransportOptions,
  nativeFetch: FetchImpl = getNativeFetchImplementation(),
): Transport {
  let pendingBodySize = 0;
  let pendingCount = 0;

  function makeRequest(request: TransportRequest): PromiseLike<TransportMakeRequestResponse> {
    const requestSize = request.body.length;
    pendingBodySize += requestSize;
    pendingCount++;

    const requestOptions: RequestInit = {
      body: request.body,
      method: 'POST',
      referrerPolicy: 'origin',
      headers: options.headers,
      // Outgoing requests are usually cancelled when navigating to a different page, causing a "TypeError: Failed to
      // fetch" error and sending a "network_error" client-outcome - in Chrome, the request status shows "(cancelled)".
      // The `keepalive` flag keeps outgoing requests alive, even when switching pages. We want this since we're
      // frequently sending events right before the user is switching pages (eg. whenfinishing navigation transactions).
      // Gotchas:
      // - `keepalive` isn't supported by Firefox
      // - As per spec (https://fetch.spec.whatwg.org/#http-network-or-cache-fetch):
      //   If the sum of contentLength and inflightKeepaliveBytes is greater than 64 kibibytes, then return a network error.
      //   We will therefore only activate the flag when we're below that limit.
      // There is also a limit of requests that can be open at the same time, so we also limit this to 15
      // See https://github.com/getsentry/sentry-javascript/pull/7553 for details
      keepalive: pendingBodySize <= 60_000 && pendingCount < 15,
      ...options.fetchOptions,
    };

    try {
      return nativeFetch(options.url, requestOptions).then(response => {
        pendingBodySize -= requestSize;
        pendingCount--;
        return {
          statusCode: response.status,
          headers: {
            'x-sentry-rate-limits': response.headers.get('X-Sentry-Rate-Limits'),
            'retry-after': response.headers.get('Retry-After'),
          },
        };
      });
    } catch (e) {
      clearCachedFetchImplementation();
      pendingBodySize -= requestSize;
      pendingCount--;
      return rejectedSyncPromise(e);
    }
  }

  return createTransport(options, makeRequest);
}