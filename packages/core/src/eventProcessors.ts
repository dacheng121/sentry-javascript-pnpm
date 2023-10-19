import type { Event, EventHint, EventProcessor } from '@monitor-web/types';
import { getGlobalSingleton, isThenable, logger, SyncPromise } from '@monitor-web/utils';

/**
 * Returns the global event processors.
 */
export function getGlobalEventProcessors(): EventProcessor[] {
  return getGlobalSingleton<EventProcessor[]>('globalEventProcessors', () => []);
}

/**
 * Add a EventProcessor to be kept globally.
 * @param callback EventProcessor to add
 */
export function addGlobalEventProcessor(callback: EventProcessor): void {
  getGlobalEventProcessors().push(callback);
}

/**
 * Process an array of event processors, returning the processed event (or `null` if the event was dropped).
 */
export function notifyEventProcessors(
  processors: EventProcessor[],
  event: Event | null,
  hint: EventHint,
  index: number = 0,
): PromiseLike<Event | null> {
  return new SyncPromise<Event | null>((resolve, reject) => {
    const processor = processors[index];
    if (event === null || typeof processor !== 'function') {
      resolve(event);
    } else {
      const result = processor({ ...event }, hint) as Event | null;

      __DEBUG_BUILD__ &&
        processor.id &&
        result === null &&
        logger.log(`Event processor "${processor.id}" dropped event`);

      if (isThenable(result)) {
        void result
          .then(final => notifyEventProcessors(processors, final, hint, index + 1).then(resolve))
          .then(null, reject);
      } else {
        void notifyEventProcessors(processors, result, hint, index + 1)
          .then(resolve)
          .then(null, reject);
      }
    }
  });
}