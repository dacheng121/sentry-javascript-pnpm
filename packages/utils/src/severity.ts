/* eslint-disable deprecation/deprecation */
import type { Severity, SeverityLevel } from '@monitor-web/types';

// Note: Ideally the `SeverityLevel` type would be derived from `validSeverityLevels`, but that would mean either
//
// a) moving `validSeverityLevels` to `@monitor-web/types`,
// b) moving the`SeverityLevel` type here, or
// c) importing `validSeverityLevels` from here into `@monitor-web/types`.
//
// Option A would make `@monitor-web/types` a runtime dependency of `@monitor-web/utils` (not good), and options B and C would
// create a circular dependency between `@monitor-web/types` and `@monitor-web/utils` (also not good). So a TODO accompanying the
// type, reminding anyone who changes it to change this list also, will have to do.

export const validSeverityLevels = ['fatal', 'error', 'warning', 'log', 'info', 'debug'];

/**
 * Converts a string-based level into a member of the deprecated {@link Severity} enum.
 *
 * @deprecated `severityFromString` is deprecated. Please use `severityLevelFromString` instead.
 *
 * @param level String representation of Severity
 * @returns Severity
 */
export function severityFromString(level: Severity | SeverityLevel | string): Severity {
  return severityLevelFromString(level) as Severity;
}

/**
 * Converts a string-based level into a `SeverityLevel`, normalizing it along the way.
 *
 * @param level String representation of desired `SeverityLevel`.
 * @returns The `SeverityLevel` corresponding to the given string, or 'log' if the string isn't a valid level.
 */
export function severityLevelFromString(level: SeverityLevel | string): SeverityLevel {
  return (level === 'warn' ? 'warning' : validSeverityLevels.includes(level) ? level : 'log') as SeverityLevel;
}
