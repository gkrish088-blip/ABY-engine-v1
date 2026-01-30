/**
 * Math & Safety Utilities
 *
 * Small, reusable helper functions used across the engine
 * to ensure numerical safety and clarity.
 *
 * No engine logic belongs here.
 */
/**
 * Clamps a number between min and max.
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
/**
 * Safe square root.
 * Returns 0 for negative or non-finite values.
 *
 * @param {number} value
 * @returns {number}
 */
export function safeSqrt(value) {
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.sqrt(value);
}
/**
 * Safe division.
 * Returns fallback if division is invalid.
 *
 * @param {number} numerator
 * @param {number} denominator
 * @param {number} fallback
 * @returns {number}
 */
export function safeDivide(numerator, denominator, fallback = 0) {
  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator === 0
  ) {
    return fallback;
  }
  return numerator / denominator;
}
/**
 * Computes a safe delta time between timestamps.
 *
 * @param {number} current
 * @param {number} previous
 * @returns {number} delta time in seconds (>= 0)
 */
export function safeDeltaTime(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) {
    return 0;
  }
  const dt = current - previous;
  return dt > 0 ? dt : 0;
}
