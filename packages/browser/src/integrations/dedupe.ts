import type { Event, Exception, Integration, StackFrame } from '@monitor-web/types';
import { logger } from '@monitor-web/utils';

/** Deduplication filter */
export class Dedupe implements Integration {
  /**
   * @inheritDoc
   */
  public static id: string = 'Dedupe';

  /**
   * @inheritDoc
   */
  public name: string;

  /**
   * @inheritDoc
   */
  private _previousEvent?: Event;

  public constructor() {
    this.name = Dedupe.id;
  }

  /** @inheritDoc */
  public setupOnce(_addGlobaleventProcessor: unknown, _getCurrentHub: unknown): void {
    // noop
  }

  /**
   * @inheritDoc
   */
  public processEvent(currentEvent: Event): Event | null {
    // We want to ignore any non-error type events, e.g. transactions or replays
    // These should never be deduped, and also not be compared against as _previousEvent.
    if (currentEvent.type) {
      return currentEvent;
    }

    // Juuust in case something goes wrong
    try {
      if (_shouldDropEvent(currentEvent, this._previousEvent)) {
        __DEBUG_BUILD__ && logger.warn('Event dropped due to being a duplicate of previously captured event.');
        return null;
      }
    } catch (_oO) {} // eslint-disable-line no-empty

    return (this._previousEvent = currentEvent);
  }
}

/** JSDoc */
function _shouldDropEvent(currentEvent: Event, previousEvent?: Event): boolean {
  if (!previousEvent) {
    return false;
  }

  if (_isSameMessageEvent(currentEvent, previousEvent)) {
    return true;
  }

  if (_isSameExceptionEvent(currentEvent, previousEvent)) {
    return true;
  }

  return false;
}

/** JSDoc */
function _isSameMessageEvent(currentEvent: Event, previousEvent: Event): boolean {
  const currentMessage = currentEvent.message;
  const previousMessage = previousEvent.message;

  // If neither event has a message property, they were both exceptions, so bail out
  if (!currentMessage && !previousMessage) {
    return false;
  }

  // If only one event has a stacktrace, but not the other one, they are not the same
  if ((currentMessage && !previousMessage) || (!currentMessage && previousMessage)) {
    return false;
  }

  if (currentMessage !== previousMessage) {
    return false;
  }

  if (!_isSameFingerprint(currentEvent, previousEvent)) {
    return false;
  }

  if (!_isSameStacktrace(currentEvent, previousEvent)) {
    return false;
  }

  return true;
}

/** JSDoc */
function _isSameExceptionEvent(currentEvent: Event, previousEvent: Event): boolean {
  const previousException = _getExceptionFromEvent(previousEvent);
  const currentException = _getExceptionFromEvent(currentEvent);

  if (!previousException || !currentException) {
    return false;
  }

  if (previousException.type !== currentException.type || previousException.value !== currentException.value) {
    return false;
  }

  if (!_isSameFingerprint(currentEvent, previousEvent)) {
    return false;
  }

  if (!_isSameStacktrace(currentEvent, previousEvent)) {
    return false;
  }

  return true;
}

/** JSDoc */
function _isSameStacktrace(currentEvent: Event, previousEvent: Event): boolean {
  let currentFrames = _getFramesFromEvent(currentEvent);
  let previousFrames = _getFramesFromEvent(previousEvent);

  // If neither event has a stacktrace, they are assumed to be the same
  if (!currentFrames && !previousFrames) {
    return true;
  }

  // If only one event has a stacktrace, but not the other one, they are not the same
  if ((currentFrames && !previousFrames) || (!currentFrames && previousFrames)) {
    return false;
  }

  currentFrames = currentFrames as StackFrame[];
  previousFrames = previousFrames as StackFrame[];

  // If number of frames differ, they are not the same
  if (previousFrames.length !== currentFrames.length) {
    return false;
  }

  // Otherwise, compare the two
  for (let i = 0; i < previousFrames.length; i++) {
    const frameA = previousFrames[i];
    const frameB = currentFrames[i];

    if (
      frameA.filename !== frameB.filename ||
      frameA.lineno !== frameB.lineno ||
      frameA.colno !== frameB.colno ||
      frameA.function !== frameB.function
    ) {
      return false;
    }
  }

  return true;
}

/** JSDoc */
function _isSameFingerprint(currentEvent: Event, previousEvent: Event): boolean {
  let currentFingerprint = currentEvent.fingerprint;
  let previousFingerprint = previousEvent.fingerprint;

  // If neither event has a fingerprint, they are assumed to be the same
  if (!currentFingerprint && !previousFingerprint) {
    return true;
  }

  // If only one event has a fingerprint, but not the other one, they are not the same
  if ((currentFingerprint && !previousFingerprint) || (!currentFingerprint && previousFingerprint)) {
    return false;
  }

  currentFingerprint = currentFingerprint as string[];
  previousFingerprint = previousFingerprint as string[];

  // Otherwise, compare the two
  try {
    return !!(currentFingerprint.join('') === previousFingerprint.join(''));
  } catch (_oO) {
    return false;
  }
}

/** JSDoc */
function _getExceptionFromEvent(event: Event): Exception | undefined {
  return event.exception && event.exception.values && event.exception.values[0];
}

/** JSDoc */
function _getFramesFromEvent(event: Event): StackFrame[] | undefined {
  const exception = event.exception;

  if (exception) {
    try {
      // @ts-expect-error Object could be undefined
      return exception.values[0].stacktrace.frames;
    } catch (_oO) {
      return undefined;
    }
  }
  return undefined;
}